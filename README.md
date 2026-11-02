# OmniVid — Premium Universal Video Downloader & Audio Extractor PWA

A modern, lightweight, fully responsive Progressive Web App (PWA) that allows users to download publicly accessible videos in their preferred video quality (4K, 1440p, 1080p, 720p, 480p, 360p) or extract pristine audio in high-bitrate MP3 or AAC M4A formats.

Crafted with design inspiration from **Linear**, **Raycast**, **Arc Browser**, and **Apple**.

---

## ✨ Features

- 📱 **Progressive Web App (PWA)**: Install directly to Android, iOS, and Desktop home screens with offline app shell support and native standalone experience.
- 🎬 **Multi-Resolution Video Downloads**: Accurately queries source providers for real resolutions (4K 2160p, 1440p 2K, 1080p Full HD, 720p HD, 480p, 360p). Never displays fake options or fabricated file sizes.
- 🎵 **High-Fidelity Audio Extraction**: Built-in FFmpeg processing converts and extracts audio into **320 kbps MP3**, **192 kbps MP3**, **AAC M4A**, or **Original Stream**.
- ⚡ **Real-Time Progress Streaming**: Server-Sent Events (SSE) telemetry displaying live progress percentage, download speed (MB/s), file size, and ETA.
- 🛡️ **Zero Tracking & Privacy-First**:
  - No user accounts, registration, or logins.
  - No database or cookies.
  - Zero permanent storage: in-flight processing files in temp storage are purged immediately upon download delivery or after 10 minutes.
  - SSRF protection against private IP access and protocol spoofing.
- 🎨 **Minimalist SaaS UI/UX**:
  - Dark and Light modes with persistent system preference sync.
  - Clipboard auto-paste button (`navigator.clipboard.readText()`).
  - Mobile-first responsive layout with iPhone notch safe-area accommodation.
  - Smooth micro-interactions and transitions.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**:
  - [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (Modern iconography)
  - Custom Service Worker (`sw.js`) & Web App Manifest (`manifest.webmanifest`)
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [yt-dlp](https://github.com/yt-dlp/yt-dlp) (Universal public media extraction engine)
  - [FFmpeg](https://ffmpeg.org/) (High-efficiency audio extraction & multiplexing)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (tested on Node v24)
- **Python 3.8+** with `yt-dlp` installed:
  ```bash
  python -m pip install yt-dlp
  ```
- **FFmpeg** installed on your system (e.g. via `winget install Gyan.FFmpeg`, `brew install ffmpeg`, or `apt install ffmpeg`).

### 1. Installation

```bash
cd Video_dwonloader
npm install
```

### 2. Development Mode

Runs both the Express API server (port 5000) and the Vite frontend dev server (port 5173 with proxy) concurrently:

```bash
npm run dev
```

Open your browser at: **`http://localhost:5173`**

### 3. Production Build & Unified Server

Builds the frontend bundle into `dist/` and runs the production Express server serving both the PWA and API from a single port:

```bash
npm run build
npm start
```

Access the application at: **`http://localhost:5000`**

---

## 🌐 Deploy to Render / Cloud

When deploying on **Render** (as a Web Service):

1. **Environment**: `Node`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`

> The automated `postinstall` script downloads the standalone `yt-dlp` binary and bundles platform-native `ffmpeg` directly in the Linux container, so zero manual Python or system package installation is required!

---

## 📲 Add to Home Screen (PWA Guide)

### 🤖 Android (Chrome / Edge / Samsung Internet)
1. Click the **"Install App"** button in the navigation bar.
2. Accept the native prompt to add OmniVid directly to your app launcher.
3. Once installed, OmniVid launches in standalone mode without browser navigation chrome.

### 🍎 iOS (iPhone & iPad Safari)
1. Open OmniVid in **Safari**.
2. Tap the **Share** button (box with upward arrow) on Safari's bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"** (`+`).
4. Tap **"Add"** in the top-right corner.
5. Launch OmniVid directly from your iPhone Home Screen.

### 💻 Desktop (Chrome / Brave / Edge)
1. Click the **Install** icon in your browser's address bar (next to the bookmark star).
2. Or click **"Install App"** in the navigation bar.

---

## 🔒 Security & Legal Restrictions

- **Authorized Media Only**: Only processes publicly accessible, authorized, non-DRM media.
- **DRM Protections**: Respects content rights; DRM-protected streams (e.g., Netflix, Spotify) are strictly rejected.
- **SSRF Prevention**: Rejects loopback addresses, local intranet ranges (`127.0.0.1`, `localhost`, `10.x.x.x`, `192.168.x.x`, `169.254.x.x`), and non-HTTP protocols.
- **Ephemeral Storage**: All temporary media processing files are stored in system temp (`os.tmpdir()`) and unlinked upon delivery or automated sweep.

---

## 📄 License

MIT License. Intended for personal backups and authorized public content retrieval.
