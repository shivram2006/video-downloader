import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const binDir = path.join(rootDir, 'bin');

// Project temp directory for in-flight media processing
const TEMP_DIR = path.join(os.tmpdir(), 'omnivid_downloads');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Active jobs cache
const activeJobs = new Map();

// Standard modern browser User-Agent
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Cache resolved runner
let cachedRunner = null;

// Download helper that follows redirects
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    function get(currentUrl) {
      const client = currentUrl.startsWith('https') ? https : http;
      client.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return get(response.headers.location);
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          return reject(new Error(`Failed to download binary: Status Code ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(destPath));
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }
    get(url);
  });
}

/**
 * Dynamically resolves the best way to execute yt-dlp on this machine
 */
async function getExecutableRunner() {
  if (cachedRunner) return cachedRunner;

  const isWindows = process.platform === 'win32';
  const binName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
  const localBin = path.join(binDir, binName);

  // 1. Check local project bin/ directory
  if (fs.existsSync(localBin)) {
    try {
      if (!isWindows) {
        fs.chmodSync(localBin, 0o755);
      }
      cachedRunner = { command: localBin, baseArgs: [] };
      console.log(`[Media Engine] Using local standalone binary: ${localBin}`);
      return cachedRunner;
    } catch (e) {
      // ignore
    }
  }

  // 2. Check if yt-dlp executable is globally in PATH
  try {
    execSync(`${isWindows ? 'where' : 'which'} yt-dlp`, { stdio: 'ignore' });
    cachedRunner = { command: 'yt-dlp', baseArgs: [] };
    console.log('[Media Engine] Using global yt-dlp from PATH');
    return cachedRunner;
  } catch (e) {}

  // 3. Check if python3 has yt_dlp module
  try {
    execSync('python3 -c "import yt_dlp"', { stdio: 'ignore' });
    cachedRunner = { command: 'python3', baseArgs: ['-m', 'yt_dlp'] };
    console.log('[Media Engine] Using python3 -m yt_dlp');
    return cachedRunner;
  } catch (e) {}

  // 4. Check if python has yt_dlp module
  try {
    execSync('python -c "import yt_dlp"', { stdio: 'ignore' });
    cachedRunner = { command: 'python', baseArgs: ['-m', 'yt_dlp'] };
    console.log('[Media Engine] Using python -m yt_dlp');
    return cachedRunner;
  } catch (e) {}

  // 5. On-the-fly download fallback: Download standalone binary if missing
  console.log('[Media Engine] Standalone binary not found. Downloading on the fly...');
  try {
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    const downloadUrl = isWindows
      ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
      : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

    await downloadFile(downloadUrl, localBin);
    if (!isWindows) {
      fs.chmodSync(localBin, 0o755);
    }
    cachedRunner = { command: localBin, baseArgs: [] };
    console.log(`[Media Engine] On-the-fly download succeeded: ${localBin}`);
    return cachedRunner;
  } catch (err) {
    console.warn(`[Media Engine] On-the-fly download failed: ${err.message}`);
  }

  // 6. Last resort fallback
  cachedRunner = { command: 'python3', baseArgs: ['-m', 'yt_dlp'] };
  return cachedRunner;
}

/**
 * Resolves FFmpeg binary path for audio extraction & muxing
 */
function getFfmpegLocation() {
  // 1. Bundled @ffmpeg-installer/ffmpeg
  if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
    return ffmpegInstaller.path;
  }

  // 2. Windows WinGet paths
  const wingetBase = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(wingetBase)) {
    try {
      const dirs = fs.readdirSync(wingetBase);
      const ffmpegPkg = dirs.find(d => d.toLowerCase().includes('gyan.ffmpeg'));
      if (ffmpegPkg) {
        const fullBuild = path.join(wingetBase, ffmpegPkg);
        const subdirs = fs.readdirSync(fullBuild);
        const binSubdir = subdirs.find(s => s.startsWith('ffmpeg-'));
        if (binSubdir) {
          const binPath = path.join(fullBuild, binSubdir, 'bin');
          if (fs.existsSync(path.join(binPath, 'ffmpeg.exe'))) {
            return binPath;
          }
        }
      }
    } catch (e) {}
  }

  // 3. System ffmpeg in PATH
  try {
    execSync(`${process.platform === 'win32' ? 'where' : 'which'} ffmpeg`, { stdio: 'ignore' });
    return 'ffmpeg';
  } catch (e) {}

  return null;
}

const FFMPEG_LOCATION = getFfmpegLocation();

// Assemble arguments with runner, user agent, certificates, and ffmpeg
async function buildYtDlpSpawnConfig(extraArgs = []) {
  const runner = await getExecutableRunner();
  const args = [
    ...runner.baseArgs,
    '--user-agent', USER_AGENT,
    '--no-check-certificates',
  ];

  if (FFMPEG_LOCATION) {
    args.push('--ffmpeg-location', FFMPEG_LOCATION);
  }

  args.push(...extraArgs);
  return {
    command: runner.command,
    args,
  };
}

// Format duration into hh:mm:ss or mm:ss
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return null;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format bytes into human-readable string
export function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes <= 0) return null;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Clean old files every 5 minutes
setInterval(() => {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > 10 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('Error during temp cleanup:', err);
  }
}, 5 * 60 * 1000);

/**
 * Validate URL to prevent SSRF and dangerous protocols
 */
export function validateUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are supported.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Prevent loopback and private network access (SSRF protection)
    const privatePatterns = [
      /^localhost$/i,
      /^127\.\d+\.\d+\.\d+$/,
      /^10\.\d+\.\d+\.\d+$/,
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
      /^192\.168\.\d+\.\d+$/,
      /^169\.254\.\d+\.\d+$/,
      /^::1$/,
      /^fe80:/i,
      /^fc00:/i,
      /^0\.0\.0\.0$/,
    ];

    if (privatePatterns.some((pattern) => pattern.test(hostname))) {
      return { valid: false, error: 'Access to private or local network resources is forbidden.' };
    }

    // Clean tracking query parameters for social media reels / posts (e.g. Instagram ?utm_source=...)
    if (hostname.includes('instagram.com') || hostname.includes('twitter.com') || hostname.includes('x.com')) {
      parsed.search = '';
    }

    return { valid: true, url: parsed.href };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format. Please provide a full link (e.g. https://...)' };
  }
}

/**
 * Inspect video URL and extract verified available formats
 */
export async function getVideoInfo(videoUrl) {
  const spawnConfig = await buildYtDlpSpawnConfig([
    '--dump-single-json',
    '--no-warnings',
    '--no-playlist',
    '--skip-download',
    videoUrl,
  ]);

  return new Promise((resolve, reject) => {
    const proc = spawn(spawnConfig.command, spawnConfig.args, {
      windowsHide: true,
      maxBuffer: 50 * 1024 * 1024,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', async (code) => {
      if (code !== 0) {
        const errMessage = stderr.toLowerCase();
        if (errMessage.includes('drm') || errMessage.includes('protected')) {
          return reject(new Error('This video is protected by DRM or copyright controls and cannot be downloaded.'));
        }
        if (errMessage.includes('login') || errMessage.includes('sign in') || errMessage.includes('cookies')) {
          return reject(new Error('This media stream requires private account login or session authentication.'));
        }
        if (errMessage.includes('unsupported url') || errMessage.includes('no video')) {
          return reject(new Error('Unsupported or invalid video URL. Please check the link.'));
        }
        return reject(new Error(stderr.split('\n')[0] || 'Failed to fetch video information from source.'));
      }

      try {
        const data = JSON.parse(stdout);
        const processed = await processRawMetadata(data, videoUrl);
        resolve(processed);
      } catch (e) {
        reject(new Error(`Failed to parse video format metadata: ${e.message}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to execute media processor: ${err.message}`));
    });
  });
}

/**
 * Transform raw yt-dlp metadata into clean, accurate UI format list
 */
async function processRawMetadata(data, originalUrl) {
  const formats = data.formats || [];
  const duration = data.duration || 0;

  // Extract real video qualities available from source
  const videoFormatsMap = new Map();

  for (const f of formats) {
    if (f.ext === 'mhtml') continue;
    if (f.format_note && f.format_note.toLowerCase().includes('storyboard')) continue;

    // Direct files often have null vcodec
    const isDirect = Boolean(data.direct || f.protocol === 'https' || f.protocol === 'http');
    const hasVideo = f.vcodec && f.vcodec !== 'none';

    if (!hasVideo && !isDirect && !f.height) continue;

    const height = f.height || (isDirect ? 720 : 0);
    const ext = f.ext === 'webm' ? 'webm' : 'mp4';

    let resLabel = `${height}p`;
    if (height >= 4320) resLabel = '8K (4320p)';
    else if (height >= 2160) resLabel = '4K (2160p)';
    else if (height >= 1440) resLabel = '1440p (2K)';
    else if (height >= 1080) resLabel = '1080p (Full HD)';
    else if (height >= 720) resLabel = '720p (HD)';
    else if (height >= 480) resLabel = '480p';
    else if (height >= 360) resLabel = '360p';
    else if (height > 0) resLabel = `${height}p`;
    else resLabel = 'Standard Quality';

    // Calculate actual or estimated size
    let sizeBytes = f.filesize || f.filesize_approx;
    if (!sizeBytes && f.tbr && duration > 0) {
      sizeBytes = Math.round((f.tbr * 1024 * duration) / 8);
    } else if (!sizeBytes && f.vbr && duration > 0) {
      const totalBitrate = (f.vbr + (f.abr || 128)) * 1024;
      sizeBytes = Math.round((totalBitrate * duration) / 8);
    }

    const key = `${height}_${ext}`;
    const existing = videoFormatsMap.get(key);
    const currentTbr = f.tbr || f.vbr || 0;
    const existingTbr = existing ? (existing.tbr || existing.vbr || 0) : 0;

    if (!existing || currentTbr > existingTbr) {
      videoFormatsMap.set(key, {
        formatId: f.format_id || 'best',
        height,
        resolutionLabel: resLabel,
        ext,
        fps: f.fps || 30,
        filesize: sizeBytes,
        filesizeFormatted: formatBytes(sizeBytes),
        vcodec: f.vcodec || 'auto',
        hasAudio: Boolean(f.acodec && f.acodec !== 'none'),
        tbr: currentTbr,
      });
    }
  }

  // If no format matched but it's a direct stream
  if (videoFormatsMap.size === 0 && (data.url || data.direct)) {
    videoFormatsMap.set('direct', {
      formatId: 'best',
      height: 720,
      resolutionLabel: 'Original Quality',
      ext: data.ext || 'mp4',
      fps: 30,
      filesize: data.filesize || null,
      filesizeFormatted: formatBytes(data.filesize),
      vcodec: 'auto',
      hasAudio: true,
      tbr: 0,
    });
  }

  // Group and sort video formats by height descending
  const videoList = Array.from(videoFormatsMap.values()).sort((a, b) => {
    if (b.height !== a.height) return b.height - a.height;
    if (a.ext === 'mp4' && b.ext !== 'mp4') return -1;
    if (b.ext === 'mp4' && a.ext !== 'mp4') return 1;
    return (b.tbr || 0) - (a.tbr || 0);
  });

  // Deduplicate
  const seenHeights = new Set();
  const cleanVideoFormats = [];
  for (const item of videoList) {
    if (!seenHeights.has(item.height)) {
      seenHeights.add(item.height);
      cleanVideoFormats.push(item);
    }
  }

  // Audio format options
  const audioFormats = [
    {
      id: 'mp3-320',
      name: 'MP3 High Quality',
      ext: 'mp3',
      bitrate: '320 kbps',
      description: 'Maximum fidelity audio',
      filesizeFormatted: formatBytes(duration ? Math.round((320 * 1024 * duration) / 8) : null),
    },
    {
      id: 'mp3-192',
      name: 'MP3 Standard',
      ext: 'mp3',
      bitrate: '192 kbps',
      description: 'Optimal balance of size & quality',
      filesizeFormatted: formatBytes(duration ? Math.round((192 * 1024 * duration) / 8) : null),
    },
    {
      id: 'm4a-aac',
      name: 'M4A (AAC)',
      ext: 'm4a',
      bitrate: '256 kbps',
      description: 'Native Apple / iOS audio container',
      filesizeFormatted: formatBytes(duration ? Math.round((256 * 1024 * duration) / 8) : null),
    },
    {
      id: 'audio-original',
      name: 'Original Audio Stream',
      ext: 'original',
      bitrate: 'Source',
      description: 'Direct audio stream from source without re-encoding',
      filesizeFormatted: formatBytes(duration ? Math.round((128 * 1024 * duration) / 8) : null),
    },
  ];

  return {
    id: data.id || 'media',
    title: data.title || data.fulltitle || 'Media Video',
    duration: duration,
    durationFormatted: formatDuration(duration),
    thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : null),
    uploader: data.uploader || data.channel || data.extractor_key || 'Public Source',
    platform: data.extractor_key || 'Universal',
    webpageUrl: data.webpage_url || originalUrl,
    videoFormats: cleanVideoFormats,
    audioFormats: audioFormats,
  };
}

/**
 * Start a download job with real-time progress callbacks
 */
export async function startDownloadJob({ url, type, formatId, height, audioFormat, customFilename }) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const outputTemplate = path.join(TEMP_DIR, `${jobId}.%(ext)s`);

  const jobState = {
    id: jobId,
    status: 'starting',
    percent: 0,
    downloaded: '0 MB',
    total: 'Calculating...',
    speed: '--',
    eta: '--',
    filename: null,
    filePath: null,
    error: null,
    process: null,
    createdAt: Date.now(),
  };

  activeJobs.set(jobId, jobState);

  const extraArgs = [
    '--newline',
    '--no-playlist',
    '--output', outputTemplate,
  ];

  if (type === 'audio') {
    extraArgs.push('-x');
    if (audioFormat === 'mp3-320') {
      extraArgs.push('--audio-format', 'mp3', '--audio-quality', '320K');
    } else if (audioFormat === 'mp3-192') {
      extraArgs.push('--audio-format', 'mp3', '--audio-quality', '192K');
    } else if (audioFormat === 'm4a-aac') {
      extraArgs.push('--audio-format', 'm4a');
    } else {
      extraArgs.push('--audio-format', 'best');
    }
  } else {
    if (formatId && formatId !== 'best') {
      extraArgs.push('-f', `${formatId}+bestaudio/best`);
    } else if (height && height > 0) {
      extraArgs.push('-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`);
    } else {
      extraArgs.push('-f', 'bestvideo+bestaudio/best');
    }
    extraArgs.push('--merge-output-format', 'mp4');
  }

  extraArgs.push(url);

  const spawnConfig = await buildYtDlpSpawnConfig(extraArgs);
  const proc = spawn(spawnConfig.command, spawnConfig.args, {
    windowsHide: true,
  });

  jobState.process = proc;
  jobState.status = 'downloading';

  proc.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    const lines = text.split(/[\r\n]+/);

    for (const line of lines) {
      const downloadMatch = line.match(/\[download\]\s+([\d\.]+)%\s+of\s+~?([\d\.]+\w+)(?:\s+at\s+([\d\.]+\w+\/s))?(?:\s+ETA\s+([\d:]+))?/);
      if (downloadMatch) {
        jobState.percent = parseFloat(downloadMatch[1]) || jobState.percent;
        jobState.total = downloadMatch[2] || jobState.total;
        if (downloadMatch[3]) jobState.speed = downloadMatch[3];
        if (downloadMatch[4]) jobState.eta = downloadMatch[4];
        jobState.status = 'downloading';
      }

      if (line.includes('[Merger]') || line.includes('[ExtractAudio]') || line.includes('[FixupM3u8]')) {
        jobState.status = 'processing';
        jobState.percent = 98;
      }

      const destMatch = line.match(/\[(?:Merger|ExtractAudio|download)\] Destination:\s+(.+)$/);
      if (destMatch) {
        jobState.filePath = destMatch[1].trim();
      }
    }
  });

  proc.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    if (text.toLowerCase().includes('error')) {
      jobState.error = text.trim();
    }
  });

  proc.on('close', (code) => {
    if (jobState.status === 'cancelled') {
      cleanupJobFiles(jobId);
      return;
    }

    if (code !== 0) {
      jobState.status = 'error';
      jobState.error = jobState.error || 'Failed to complete media processing.';
      return;
    }

    // Locate resulting file in temp directory
    if (!jobState.filePath || !fs.existsSync(jobState.filePath)) {
      const files = fs.readdirSync(TEMP_DIR);
      const matched = files.find(f => f.startsWith(jobId));
      if (matched) {
        jobState.filePath = path.join(TEMP_DIR, matched);
      }
    }

    if (jobState.filePath && fs.existsSync(jobState.filePath)) {
      jobState.status = 'completed';
      jobState.percent = 100;
      jobState.speed = 'Complete';
      jobState.eta = '00:00';

      const ext = path.extname(jobState.filePath);
      const cleanBase = (customFilename || 'download')
        .replace(/[\\/:*?"<>|]/g, '_')
        .substring(0, 100);
      jobState.filename = `${cleanBase}${ext}`;
    } else {
      jobState.status = 'error';
      jobState.error = 'Result file could not be verified on the server.';
    }
  });

  proc.on('error', (err) => {
    jobState.status = 'error';
    jobState.error = err.message;
  });

  return jobId;
}

export function getJobStatus(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) return null;
  return {
    id: job.id,
    status: job.status,
    percent: job.percent,
    total: job.total,
    speed: job.speed,
    eta: job.eta,
    filename: job.filename,
    error: job.error,
  };
}

export function cancelJob(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) return false;

  job.status = 'cancelled';
  if (job.process) {
    try {
      job.process.kill('SIGKILL');
    } catch (e) {
      // ignore
    }
  }

  cleanupJobFiles(jobId);
  activeJobs.delete(jobId);
  return true;
}

export function cleanupJobFiles(jobId) {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    for (const f of files) {
      if (f.startsWith(jobId)) {
        fs.unlinkSync(path.join(TEMP_DIR, f));
      }
    }
  } catch (e) {
    // ignore
  }
}

export function getJobFile(jobId) {
  const job = activeJobs.get(jobId);
  if (!job || job.status !== 'completed' || !job.filePath || !fs.existsSync(job.filePath)) {
    return null;
  }
  return {
    filePath: job.filePath,
    filename: job.filename,
  };
}
