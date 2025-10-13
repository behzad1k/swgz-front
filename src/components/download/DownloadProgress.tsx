import { FC } from 'react';

interface DownloadProgressProps {
  progress: number;
  total: number;
  current: number;
}

const DownloadProgress: FC<DownloadProgressProps> = ({ progress, total, current }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Downloading {current} of {total}</span>
        <span className="text-white font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default DownloadProgress;