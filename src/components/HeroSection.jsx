import React, { useState } from 'react';
import { Link2, Clipboard, ArrowRight, Loader2, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HeroSection({
  url,
  setUrl,
  onFetchInfo,
  isLoading,
  error,
  clearError,
}) {
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Handle Clipboard Paste
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          clearError();
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onFetchInfo(url.trim());
  };

  const handleClear = () => {
    setUrl('');
    clearError();
  };

  const sampleLinks = [
    { name: 'Public MP4 Video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { name: 'Creative Commons WebM', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm' },
    { name: 'Audio Stream Sample', url: 'https://www.w3schools.com/html/horse.mp3' },
  ];

  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 radial-glow pointer-events-none -z-10" />

      {/* Hero Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>Universal Format Engine &bull; Zero Registration</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-3xl mx-auto leading-[1.15]">
        Your Videos. <span className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 bg-clip-text text-transparent">Your Quality.</span> Your Choice.
      </h1>

      {/* Subheading */}
      <p className="mt-4 sm:mt-5 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
        Download videos in your preferred quality or convert them into audio. Simple, fast and free.
      </p>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="mt-8 sm:mt-10 max-w-2xl mx-auto">
        <div className="relative group">
          
          {/* Glowing border effect on focus */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-20 group-hover:opacity-35 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>

          <div className="relative flex items-center bg-white dark:bg-[#121216] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-premium dark:shadow-premium-dark p-1.5 sm:p-2 transition-all">
            
            {/* Link Icon */}
            <div className="pl-3 sm:pl-4 pr-2 text-neutral-400 dark:text-neutral-500 flex-shrink-0">
              <Link2 className="w-5 h-5" />
            </div>

            {/* Video URL Input */}
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) clearError();
              }}
              placeholder="Paste your video link here..."
              className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none py-2 px-1"
              required
            />

            {/* Clear Input Button */}
            {url && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear input"
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste Link Button */}
            <button
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="hidden xs:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mr-1.5 flex-shrink-0"
            >
              {pasteSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Pasted</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </>
              )}
            </button>

            {/* Download / Process Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm text-left flex items-start space-x-2.5 animate-fadeIn">
            <span className="font-bold flex-shrink-0">⚠️ Error:</span>
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick sample test links */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-medium">Try public samples:</span>
          {sampleLinks.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                clearError();
                onFetchInfo(sample.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 transition-colors border border-neutral-200/60 dark:border-neutral-700/50"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
