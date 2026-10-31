import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import ResultCard from './components/ResultCard.jsx';
import DownloadModal from './components/DownloadModal.jsx';
import PwaInstallModal from './components/PwaInstallModal.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import SupportedPlatforms from './components/SupportedPlatforms.jsx';
import FaqSection from './components/FaqSection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  // Theme state: defaults to dark for premium Linear/Raycast look
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('omnivid-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Video Inspection State
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);

  // In-flight Download Job State
  const [activeJobId, setActiveJobId] = useState(null);
  const [downloadMeta, setDownloadMeta] = useState(null);

  // Sync theme with DOM and meta theme-color
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('omnivid-theme', theme);

    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#09090b' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Setup PWA install listeners
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Fetch format metadata from backend
  const handleFetchInfo = async (targetUrl) => {
    setIsLoading(true);
    setError(null);
    setMediaInfo(null);

    try {
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to inspect media stream.');
      }

      setMediaInfo(data.data);
    } catch (err) {
      setError(err.message || 'Unable to connect to the media server. Please check your URL.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start download or audio extraction
  const handleStartDownload = async ({ url: videoUrl, type, formatId, height, audioFormat, title, label }) => {
    setError(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          type,
          formatId,
          height,
          audioFormat,
          title,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not start download job.');
      }

      setDownloadMeta({
        title,
        label,
        type,
      });
      setActiveJobId(data.jobId);
    } catch (err) {
      setError(err.message || 'Download initialization error.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenInstall={() => setInstallModalOpen(true)}
        isInstalled={isInstalled}
        canInstallPrompt={Boolean(deferredPrompt)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with URL Input */}
        <HeroSection
          url={url}
          setUrl={setUrl}
          onFetchInfo={handleFetchInfo}
          isLoading={isLoading}
          error={error}
          clearError={() => setError(null)}
        />

        {/* Real-time Quality & Format Options */}
        {mediaInfo && (
          <ResultCard
            mediaInfo={mediaInfo}
            onStartDownload={handleStartDownload}
          />
        )}

        {/* How It Works Guide */}
        <HowItWorks />

        {/* Supported Platforms */}
        <SupportedPlatforms />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Real-Time Download Progress Modal */}
      {activeJobId && downloadMeta && (
        <DownloadModal
          jobId={activeJobId}
          downloadMeta={downloadMeta}
          onClose={() => {
            setActiveJobId(null);
            setDownloadMeta(null);
          }}
          onDownloadAgain={() => {
            setActiveJobId(null);
            setDownloadMeta(null);
          }}
        />
      )}

      {/* PWA Installation Guide Modal */}
      <PwaInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setIsInstalled(true)}
      />
    </div>
  );
}
