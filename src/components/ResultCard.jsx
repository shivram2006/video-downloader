import React, { useState } from 'react';
import { Video, Music, Download, Clock, User, HardDrive, Check, Sparkles, ExternalLink } from 'lucide-react';

export default function ResultCard({
  mediaInfo,
  onStartDownload,
}) {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'audio'

  if (!mediaInfo) return null;

  const {
    title,
    thumbnail,
    durationFormatted,
    uploader,
    platform,
    webpageUrl,
    videoFormats = [],
    audioFormats = [],
  } = mediaInfo;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-16 animate-fadeIn">
      <div className="bg-white dark:bg-[#121216] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-premium dark:shadow-premium-dark overflow-hidden transition-colors">
        
        {/* Top Info Banner / Header */}
        <div className="p-5 sm:p-7 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            
            {/* Thumbnail with overlay duration */}
            <div className="relative w-full sm:w-56 h-36 sm:h-32 rounded-2xl overflow-hidden bg-neutral-900 flex-shrink-0 shadow-md">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Video className="w-10 h-10" />
                </div>
              )}
              
              {/* Duration Badge */}
              {durationFormatted && durationFormatted !== '0:00' && (
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-semibold text-white flex items-center space-x-1 shadow-sm">
                  <Clock className="w-3 h-3" />
                  <span>{durationFormatted}</span>
                </div>
              )}

              {/* Source Platform Badge */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                {platform}
              </div>
            </div>

            {/* Video Metadata */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2">
                {title}
              </h2>
              
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                {uploader && (
                  <div className="flex items-center space-x-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{uploader}</span>
                  </div>
                )}
                {webpageUrl && (
                  <a
                    href={webpageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 hover:text-indigo-500 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Source</span>
                  </a>
                )}
              </div>

              {/* Quick stats pills */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  {videoFormats.length} Video Qualities Available
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Audio Extraction Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection: VIDEO or AUDIO */}
        <div className="px-5 sm:px-7 pt-4 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Qualities</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'video' ? 'bg-indigo-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                {videoFormats.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'audio'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio & Music</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'audio' ? 'bg-indigo-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                {audioFormats.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content: Format Cards */}
        <div className="p-5 sm:p-7">
          {activeTab === 'video' ? (
            <div>
              {videoFormats.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No discrete video resolutions found for this URL. Try downloading the audio stream.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videoFormats.map((format, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-neutral-50/40 dark:bg-[#16161c] hover:bg-white dark:hover:bg-[#191922] transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Quality Badge */}
                        <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs ${
                          format.height >= 1080
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}>
                          <span>{format.height}p</span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-75">{format.ext}</span>
                        </div>

                        {/* Description */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                              {format.resolutionLabel}
                            </span>
                            {format.height >= 1080 && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                High Res
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            <span>{format.ext.toUpperCase()}</span>
                            <span>&bull;</span>
                            <span>{format.filesizeFormatted || 'Stream source'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Download Action Button */}
                      <button
                        onClick={() =>
                          onStartDownload({
                            url: mediaInfo.webpageUrl,
                            type: 'video',
                            formatId: format.formatId,
                            height: format.height,
                            title: mediaInfo.title,
                            label: `${format.resolutionLabel} (${format.ext.toUpperCase()})`,
                          })
                        }
                        className="flex-shrink-0 ml-3 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-indigo-600 dark:bg-neutral-800 dark:hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm group-hover:shadow-indigo-500/20 transition-all duration-200 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {audioFormats.map((audio, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-neutral-50/40 dark:bg-[#16161c] hover:bg-white dark:hover:bg-[#191922] transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Audio format badge */}
                    <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex flex-col items-center justify-center font-bold text-xs">
                      <span>{audio.ext.toUpperCase()}</span>
                      <span className="text-[8px] opacity-75">{audio.bitrate.split(' ')[0]}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                          {audio.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span>{audio.bitrate}</span>
                        {audio.filesizeFormatted && (
                          <>
                            <span>&bull;</span>
                            <span>{audio.filesizeFormatted}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extract & Download Button */}
                  <button
                    onClick={() =>
                      onStartDownload({
                        url: mediaInfo.webpageUrl,
                        type: 'audio',
                        audioFormat: audio.id,
                        title: `${mediaInfo.title} - ${audio.name}`,
                        label: `${audio.name}`,
                      })
                    }
                    className="flex-shrink-0 ml-3 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-violet-600 dark:bg-neutral-800 dark:hover:bg-violet-600 text-white text-xs font-semibold shadow-sm group-hover:shadow-violet-500/20 transition-all duration-200 active:scale-95"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Extract</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
