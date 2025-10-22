// src/components/Player/DownloadProgress.tsx
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

export const DownloadProgress = () => {
  const { isDownloading, downloadProgress, downloadStatus } = useAudioPlayer();

  if (!isDownloading) return null;

  const getStatusText = () => {
    switch (downloadStatus.status) {
      case 'searching':
        return 'Searching for track...';
      case 'downloading':
        return `Downloading... ${downloadProgress}%`;
      case 'ready':
        return 'Ready to play';
      default:
        return 'Preparing...';
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center space-x-3">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - downloadProgress / 100)}`}
            className="text-blue-500 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {downloadProgress}%
        </div>
      </div>
      <div>
        <div className="text-sm font-medium">{getStatusText()}</div>
        {downloadStatus.status === 'downloading' && (
          <div className="text-xs text-gray-400">Buffering audio...</div>
        )}
      </div>
    </div>
  );
};