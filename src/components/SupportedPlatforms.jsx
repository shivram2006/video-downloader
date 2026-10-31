import React from 'react';
import { Globe2, ShieldCheck, Film, Video, Play, Music, Sparkles } from 'lucide-react';

export default function SupportedPlatforms() {
  const platforms = [
    { name: 'YouTube', type: 'Public Videos', color: 'from-red-500 to-rose-600' },
    { name: 'Vimeo', type: 'HD & 4K Streams', color: 'from-sky-500 to-blue-600' },
    { name: 'TikTok', type: 'Shorts & Clips', color: 'from-neutral-800 to-neutral-950' },
    { name: 'Twitter / X', type: 'Clips & Media', color: 'from-neutral-700 to-neutral-900' },
    { name: 'Instagram', type: 'Public Reels', color: 'from-pink-500 to-purple-600' },
    { name: 'Facebook', type: 'Public Video', color: 'from-blue-600 to-indigo-700' },
    { name: 'Reddit', type: 'Video Posts', color: 'from-orange-500 to-red-600' },
    { name: 'Twitch', type: 'Clips & VODs', color: 'from-purple-600 to-violet-700' },
    { name: 'SoundCloud', type: 'Audio Tracks', color: 'from-amber-500 to-orange-600' },
    { name: 'Direct MP4', type: 'Any HTTP Link', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <section id="platforms" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-3">
          <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Universal Source Compatibility</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Supported Platforms
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Compatible with thousands of video providers, educational archives, public media domains, and direct video URLs.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {platforms.map((p, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-neutral-200/70 dark:border-neutral-800/80 hover:border-indigo-400/80 dark:hover:border-indigo-500/50 shadow-sm transition-all duration-200 text-center flex flex-col items-center justify-center group"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-sm mb-2.5 group-hover:scale-105 transition-transform`}>
              <Play className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
              {p.name}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {p.type}
            </span>
          </div>
        ))}
      </div>

      {/* Compliance / DRM Notice banner */}
      <div className="mt-10 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 flex items-start sm:items-center space-x-3 text-xs text-neutral-600 dark:text-neutral-400">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">Legal & DRM Policy: </span>
          OmniVid only downloads content that you own, have explicit permission to access, or that is legally available in the public domain. DRM-protected content (e.g. Netflix, Spotify, Disney+) is strictly not supported.
        </div>
      </div>
    </section>
  );
}
