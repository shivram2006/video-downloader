import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Is OmniVid completely free to use?',
      a: 'Yes. OmniVid is 100% free with no hidden subscriptions, credit card requirements, or download limits. There are no user accounts, database tracking, or sign-in walls.',
    },
    {
      q: 'How do I install the app on my iPhone or iPad?',
      a: 'Open OmniVid in Safari, tap the Share button in the bottom navigation bar, scroll down and tap "Add to Home Screen", then tap "Add" in the top-right corner. The app will launch in standalone fullscreen mode just like an App Store app.',
    },
    {
      q: 'How does Android installation work?',
      a: 'On Android using Chrome, Samsung Internet, or Edge, click the "Install App" button in the navigation bar. Your browser will prompt you to add OmniVid directly to your home screen.',
    },
    {
      q: 'Why are only certain resolutions shown for my video?',
      a: 'OmniVid queries the source provider in real time and only presents actual resolutions and bitrates provided by the video publisher. We never display fake 4K or 1080p options or fabricate download links if the source does not supply them.',
    },
    {
      q: 'How does audio extraction work?',
      a: 'When you select the AUDIO tab, OmniVid streams the source audio and uses high-fidelity FFmpeg encoding to convert it into high-bitrate MP3 (320kbps / 192kbps) or AAC M4A without loss of quality.',
    },
    {
      q: 'Do you store downloaded videos on your servers?',
      a: 'No. Downloaded media files are processed temporarily in volatile system storage and are automatically cleaned up immediately after delivery to your browser or after 10 minutes. No personal media is ever stored permanently.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Common Questions</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Everything you need to know about the product and installation.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121216] overflow-hidden transition-all duration-200 shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-indigo-500' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
