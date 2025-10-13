import { Check, X } from 'lucide-react';
import { FC } from 'react';

interface DownloadItemProps {
  id: string;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  songName: string;
  onCancel?: () => void;
}

const DownloadItem: FC<DownloadItemProps> = ({ id, progress, status, songName, onCancel }) => {
  console.log(id);
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium truncate">{songName}</span>
        {status === 'active' && onCancel && (
          <button onClick={onCancel} className="text-red-400 hover:text-red-300">
            <X size={20} />
          </button>
        )}
        {status === 'completed' && <Check size={20} className="text-green-400" />}
        {status === 'failed' && <X size={20} className="text-red-400" />}
      </div>
      {status === 'active' && (
        <>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-400 mt-1">{progress}%</div>
        </>
      )}
    </div>
  );
};

export default DownloadItem;