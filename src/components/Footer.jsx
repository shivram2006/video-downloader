import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#0c0c0e] py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center p-1 shadow-sm">
            <img src="/icon.svg" alt="OmniVid" className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white">
              OmniVid
            </span>
            <p className="text-[11px] text-neutral-500">
              Universal Video Downloader &bull; Progressive Web App
            </p>
          </div>
        </div>

        {/* Guarantees / Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>No Account Required</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Zero Tracking & Cookies</span>
          </div>
          <span>&bull;</span>
          <span>Automatic File Purging</span>
        </div>

        {/* Copyright notice */}
        <div className="text-center md:text-right text-[11px] text-neutral-400">
          <p>&copy; {new Date().getFullYear()} OmniVid. All rights reserved.</p>
          <p className="mt-0.5">Built for public content & authorized media extraction.</p>
        </div>
      </div>
    </footer>
  );
}
