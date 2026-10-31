import React from 'react';
import { Link2, SlidersHorizontal, ArrowDownToLine, Zap, Shield, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Paste Video Link',
      desc: 'Copy the URL from any supported public video or stream and paste it into the search bar.',
      icon: Link2,
      accent: 'from-blue-500 to-indigo-600',
    },
    {
      step: '02',
      title: 'Select Quality or Audio',
      desc: 'OmniVid inspects the source in real time. Choose from 4K, 1080p, 720p, or extract MP3 audio.',
      icon: SlidersHorizontal,
      accent: 'from-indigo-600 to-violet-600',
    },
    {
      step: '03',
      title: 'Instant Download',
      desc: 'Watch real-time download progress and get the pristine media file saved directly to your device.',
      icon: ArrowDownToLine,
      accent: 'from-violet-600 to-purple-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>Streamlined Flow</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          How It Works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Built for simplicity and speed. No registration, no ads, no wait times.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="relative p-7 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200/80 dark:border-neutral-800/80 shadow-premium dark:shadow-premium-dark flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.accent} text-white flex items-center justify-center shadow-md shadow-indigo-500/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-neutral-200 dark:text-neutral-800">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Zero Storage Footprint</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
