import React, { useEffect, useState } from 'react';
import { X, Smartphone, Share, PlusSquare, CheckCircle, Monitor, ArrowRight, Sparkles } from 'lucide-react';

export default function PwaInstallModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) {
  const [platform, setPlatform] = useState('android'); // 'ios' | 'android' | 'desktop'

  useEffect(() => {
    // Detect OS & Browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent);

    if (isIos) {
      setPlatform('ios');
    } else if (isMobile) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  if (!isOpen) return null;

  // Handle native install prompt for Android / Chrome / Edge
  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#121216] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-neutral-900 dark:text-neutral-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-md shadow-indigo-500/25 flex items-center justify-center">
            <img src="/icon.svg" alt="OmniVid" className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              Install OmniVid PWA
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Zero App Store downloads &bull; Instant Launch
            </p>
          </div>
        </div>

        {/* Platform Tabs selector */}
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl mb-5 text-xs font-semibold">
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              platform === 'android'
                ? 'bg-white dark:bg-[#1c1c24] text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              platform === 'ios'
                ? 'bg-white dark:bg-[#1c1c24] text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            iOS (iPhone/iPad)
          </button>
          <button
            onClick={() => setPlatform('desktop')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              platform === 'desktop'
                ? 'bg-white dark:bg-[#1c1c24] text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Desktop
          </button>
        </div>

        {/* Content based on platform */}
        {platform === 'ios' ? (
          /* iOS Safari Guide */
          <div className="space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Apple iOS requires adding web apps to your Home Screen manually via Safari:
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Step 1 */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white">1. Tap Share</span>
                  <p className="text-neutral-500 text-[11px]">Located at the bottom of Safari's toolbar</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white">2. Add to Home Screen</span>
                  <p className="text-neutral-500 text-[11px]">Scroll down the share sheet and tap the option</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white">3. Tap Add</span>
                  <p className="text-neutral-500 text-[11px]">In the top-right corner to launch standalone</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
            >
              Got It
            </button>
          </div>
        ) : platform === 'android' ? (
          /* Android / Chrome Native Prompt */
          <div className="space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Install OmniVid directly to your Android launcher for a native, fast fullscreen experience with offline access.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>PWA Advantages</span>
              </div>
              <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 text-[11px] space-y-1">
                <li>Zero storage footprint (under 2 MB)</li>
                <li>Instant startup with standalone UI</li>
                <li>Integrated download management</li>
              </ul>
            </div>

            {deferredPrompt ? (
              <button
                onClick={handleNativeInstall}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install to Home Screen Now</span>
              </button>
            ) : (
              <div className="text-center py-2 space-y-3">
                <p className="text-xs text-neutral-500">
                  Tap the browser menu (three dots <span className="font-bold">&vellip;</span>) in Chrome and select <span className="font-bold text-neutral-900 dark:text-white">"Install app"</span> or <span className="font-bold text-neutral-900 dark:text-white">"Add to Home Screen"</span>.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Installation */
          <div className="space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Install OmniVid as a native desktop application in Chrome, Edge, or Brave:
            </p>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 text-xs">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white">Look at the address bar</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">Click the "Install" icon in your URL bar next to the bookmark star.</p>
              </div>
            </div>

            {deferredPrompt && (
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Install Desktop App</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
