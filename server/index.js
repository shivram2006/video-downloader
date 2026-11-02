import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  validateUrl,
  getVideoInfo,
  startDownloadJob,
  getJobStatus,
  cancelJob,
  getJobFile,
  cleanupJobFiles,
} from './downloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OmniVid Engine',
    timestamp: new Date().toISOString(),
  });
});

// Fetch video metadata & available qualities
app.post('/api/info', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid URL is required.' });
  }

  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  try {
    const info = await getVideoInfo(validation.url);
    res.json({ success: true, data: info });
  } catch (err) {
    console.error('Info extraction error:', err.message);
    res.status(422).json({
      success: false,
      error: err.message || 'Unable to process this video URL. Please ensure it is publicly accessible.',
    });
  }
});

// Start a media download or audio extraction job
app.post('/api/download', async (req, res) => {
  const { url, type, formatId, height, audioFormat, title } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid URL is required.' });
  }

  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  try {
    const jobId = await startDownloadJob({
      url: validation.url,
      type: type === 'audio' ? 'audio' : 'video',
      formatId,
      height,
      audioFormat,
      customFilename: title,
    });

    res.json({ success: true, jobId });
  } catch (err) {
    console.error('Download start error:', err);
    res.status(500).json({ success: false, error: 'Could not initialize download job.' });
  }
});

// Poll job progress
app.get('/api/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const status = getJobStatus(jobId);

  if (!status) {
    return res.status(404).json({ success: false, error: 'Job not found or has expired.' });
  }

  res.json({ success: true, job: status });
});

// Server-Sent Events (SSE) for buttery smooth real-time progress updates
app.get('/api/progress/:jobId/stream', (req, res) => {
  const { jobId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  const timer = setInterval(() => {
    const status = getJobStatus(jobId);
    if (!status) {
      res.write(`data: ${JSON.stringify({ status: 'not_found' })}\n\n`);
      clearInterval(timer);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify(status)}\n\n`);

    if (status.status === 'completed' || status.status === 'error' || status.status === 'cancelled') {
      clearInterval(timer);
      res.end();
    }
  }, 350);

  req.on('close', () => {
    clearInterval(timer);
  });
});

// Cancel active job
app.post('/api/cancel/:jobId', (req, res) => {
  const { jobId } = req.params;
  const success = cancelJob(jobId);
  res.json({ success });
});

// Handle HEAD requests for download inspection
app.head('/api/download/:jobId/file', (req, res) => {
  const { jobId } = req.params;
  const fileInfo = getJobFile(jobId);
  if (!fileInfo) {
    return res.status(404).end();
  }
  try {
    const stat = fs.statSync(fileInfo.filePath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`);
    res.status(200).end();
  } catch (e) {
    res.status(500).end();
  }
});

// Serve the finished file and trigger browser download
app.get('/api/download/:jobId/file', (req, res) => {
  const { jobId } = req.params;
  const fileInfo = getJobFile(jobId);

  if (!fileInfo) {
    return res.status(404).send('File not found, expired, or already downloaded.');
  }

  const { filePath, filename } = fileInfo;

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('File delivery error:', err.message);
    }
    // Delete file immediately after delivery to comply with zero permanent storage
    setTimeout(() => {
      cleanupJobFiles(jobId);
    }, 2000);
  });
});

// In production, serve the built React PWA
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`✨ OmniVid Universal Video Downloader server running at http://localhost:${PORT}`);
});
