import React, { useState } from 'react';
import { Download, Sun, Moon, Sparkles, Smartphone, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar({
  theme,
  toggleTheme,
  onOpenInstall,
  isInstalled,
  canInstallPrompt,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#09090b] dark:bg-[#09090b] rounded-[10px] flex items-center justify-center overflow-hidden">
              <img src="/icon.svg" alt="OmniVid" className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
                OmniVid
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                PWA
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            How it works
          </button>
          <button onClick={() => scrollTo('platforms')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Platforms
          </button>
          <button onClick={() => scrollTo('faq')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            FAQ
          </button>
        </div>

        {/* Right Actions: Theme Toggle & Install App */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* PWA Install Button */}
          {!isInstalled ? (
            <button
              onClick={onOpenInstall}
              className="relative group flex items-center space-x-2 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:shadow-indigo-500/25 hover:shadow-md active:scale-[0.98] transition-all duration-200"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden xs:inline">Install App</span>
              <span className="xs:hidden">Install</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-400"></span>
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Installed PWA</span>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 space-y-2 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-xl">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo('platforms')}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Supported Platforms
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Frequently Asked Questions
          </button>
          {!isInstalled && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstall();
              }}
              className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install to Home Screen</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
