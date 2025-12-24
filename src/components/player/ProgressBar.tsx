import { FC } from 'react';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, duration, onSeek }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * duration;
  return (
    <div className="w-full space-y-2">
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-sm text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
