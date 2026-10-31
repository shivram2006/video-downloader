import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, AlertCircle, X, Loader2, HardDrive, Zap, Clock, RotateCcw } from 'lucide-react';

export default function DownloadModal({
  jobId,
  downloadMeta,
  onClose,
  onDownloadAgain,
}) {
  const [jobState, setJobState] = useState({
    status: 'starting',
    percent: 0,
    speed: '--',
    total: '--',
    eta: '--',
    filename: null,
    error: null,
  });

  const [hasTriggeredSave, setHasTriggeredSave] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    let sseSource = null;
    let pollInterval = null;

    // Use SSE (Server-Sent Events) for real-time progress
    try {
      sseSource = new EventSource(`/api/progress/${jobId}/stream`);

      sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.status) {
            setJobState((prev) => ({
              ...prev,
              status: data.status,
              percent: data.percent !== undefined ? Math.round(data.percent) : prev.percent,
              speed: data.speed || prev.speed,
              total: data.total || prev.total,
              eta: data.eta || prev.eta,
              filename: data.filename || prev.filename,
              error: data.error || prev.error,
            }));

            // Auto-trigger browser file download on completion
            if (data.status === 'completed' && !hasTriggeredSave) {
              setHasTriggeredSave(true);
              triggerFileDownload(jobId);
              sseSource.close();
            }

            if (data.status === 'error' || data.status === 'cancelled') {
              sseSource.close();
            }
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      sseSource.onerror = () => {
        // Fall back to polling if SSE fails
        if (sseSource) sseSource.close();
        startPolling();
      };
    } catch (e) {
      startPolling();
    }

    function startPolling() {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/progress/${jobId}`);
          const data = await res.json();
          if (data && data.job) {
            setJobState((prev) => ({
              ...prev,
              status: data.job.status,
              percent: data.job.percent !== undefined ? Math.round(data.job.percent) : prev.percent,
              speed: data.job.speed || prev.speed,
              total: data.job.total || prev.total,
              eta: data.job.eta || prev.eta,
              filename: data.job.filename || prev.filename,
              error: data.job.error || prev.error,
            }));

            if (data.job.status === 'completed' && !hasTriggeredSave) {
              setHasTriggeredSave(true);
              triggerFileDownload(jobId);
              clearInterval(pollInterval);
            }

            if (data.job.status === 'error' || data.job.status === 'cancelled') {
              clearInterval(pollInterval);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 500);
    }

    return () => {
      if (sseSource) sseSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId, hasTriggeredSave]);

  const triggerFileDownload = (id) => {
    const link = document.createElement('a');
    link.href = `/api/download/${id}/file`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = async () => {
    try {
      await fetch(`/api/cancel/${jobId}`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setJobState((prev) => ({ ...prev, status: 'cancelled' }));
  };

  const getPhaseMessage = () => {
    switch (jobState.status) {
      case 'starting':
        return 'Connecting to media stream...';
      case 'downloading':
        return `Streaming ${downloadMeta.type === 'audio' ? 'audio' : 'video'} data...`;
      case 'processing':
        return 'Merging streams & finalizing format...';
      case 'completed':
        return 'Ready! Download started in your browser.';
      case 'cancelled':
        return 'Download cancelled.';
      case 'error':
        return 'Media processing failed.';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121216] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Top Close Button (if completed or errored) */}
        {(jobState.status === 'completed' || jobState.status === 'error' || jobState.status === 'cancelled') && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content Section */}
        <div className="text-center">
          
          {/* Status Animated Icon */}
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center">
            {jobState.status === 'completed' ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce-short">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : jobState.status === 'error' ? (
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-9 h-9" />
              </div>
            ) : jobState.status === 'cancelled' ? (
              <div className="w-16 h-16 rounded-2xl bg-neutral-500/10 border border-neutral-500/20 text-neutral-500 flex items-center justify-center">
                <X className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center relative">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
          </div>

          {/* Title & Format */}
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-1">
            {downloadMeta.title || 'Downloading Media'}
          </h3>
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            {downloadMeta.label}
          </p>

          {/* Main Progress Indicator */}
          {jobState.status !== 'error' && jobState.status !== 'cancelled' && (
            <div className="mt-6">
              
              {/* Progress Percentage Display */}
              <div className="flex items-center justify-between text-sm font-semibold mb-2">
                <span className="text-neutral-600 dark:text-neutral-400 text-xs">
                  {getPhaseMessage()}
                </span>
                <span className="text-neutral-900 dark:text-white font-mono font-bold text-base">
                  {jobState.percent}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${Math.max(5, Math.min(100, jobState.percent))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
              </div>

              {/* Real-time telemetry: Speed, Total, ETA */}
              <div className="mt-4 grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 text-xs">
                <div className="flex flex-col items-center">
                  <span className="text-neutral-400 text-[10px] uppercase font-bold flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Speed</span>
                  </span>
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {jobState.speed}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-neutral-400 text-[10px] uppercase font-bold flex items-center space-x-1">
                    <HardDrive className="w-3 h-3 text-indigo-500" />
                    <span>Total</span>
                  </span>
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {jobState.total}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-neutral-400 text-[10px] uppercase font-bold flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span>ETA</span>
                  </span>
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {jobState.eta}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {jobState.status === 'error' && (
            <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-left">
              <span className="font-bold">Error:</span> {jobState.error || 'The download could not be completed.'}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {jobState.status === 'downloading' || jobState.status === 'starting' || jobState.status === 'processing' ? (
              <button
                onClick={handleCancel}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel Download
              </button>
            ) : jobState.status === 'completed' ? (
              <>
                <button
                  onClick={() => triggerFileDownload(jobId)}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Again</span>
                </button>
                <button
                  onClick={onDownloadAgain}
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs sm:text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Download Another</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-semibold text-xs sm:text-sm hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
