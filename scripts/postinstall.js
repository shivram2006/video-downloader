import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const binDir = path.join(rootDir, 'bin');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Determine binary name for current platform
const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const targetBinaryPath = path.join(binDir, binaryName);

const downloadUrl = isWindows
  ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
  : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

// Download helper that follows HTTP 301/302 redirects
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    function get(currentUrl) {
      const client = currentUrl.startsWith('https') ? https : http;
      client.get(currentUrl, (response) => {
        // Handle redirect
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return get(response.headers.location);
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          return reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
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

async function setupYtDlp() {
  console.log('🚀 [OmniVid Setup] Initializing media dependencies...');

  // 1. Try pip installation first
  const pipCommands = [
    'python3 -m pip install -U yt-dlp --break-system-packages',
    'python3 -m pip install -U yt-dlp',
    'pip3 install -U yt-dlp',
    'python -m pip install -U yt-dlp',
    'pip install -U yt-dlp',
  ];

  let pipSuccess = false;
  for (const cmd of pipCommands) {
    try {
      console.log(`📦 Trying: ${cmd}`);
      execSync(cmd, { stdio: 'ignore', timeout: 30000 });
      console.log(`✅ yt-dlp installed successfully via pip (${cmd})`);
      pipSuccess = true;
      break;
    } catch (e) {
      // Continue to next pip command or standalone binary
    }
  }

  // 2. Download the standalone binary if not already present
  if (fs.existsSync(targetBinaryPath) && fs.statSync(targetBinaryPath).size > 1000000) {
    console.log(`✅ Standalone yt-dlp binary already present at ${targetBinaryPath}`);
    if (!isWindows) {
      fs.chmodSync(targetBinaryPath, 0o755);
    }
  } else {
    console.log(`⬇️ Downloading standalone yt-dlp binary for ${process.platform}...`);
    try {
      await downloadFile(downloadUrl, targetBinaryPath);
      if (!isWindows) {
        fs.chmodSync(targetBinaryPath, 0o755);
      }
      console.log(`✅ Standalone yt-dlp binary ready at ${targetBinaryPath}`);
    } catch (err) {
      console.warn(`⚠️ Standalone binary download failed: ${err.message}`);
      if (!pipSuccess) {
        console.error('❌ Warning: Neither pip nor standalone download succeeded. Will retry at runtime.');
      }
    }
  }

  console.log('✨ [OmniVid Setup] Setup completed successfully!');
}

setupYtDlp().catch((err) => {
  console.error('Setup encountered an error:', err);
  // Don't crash npm install if network fails during build, runtime fallback will handle it
  process.exit(0);
});
