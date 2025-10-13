import { Volume2, VolumeX } from 'lucide-react';
import { FC } from 'react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

const VolumeControl: FC<VolumeControlProps> = ({ volume, onVolumeChange, onMuteToggle, isMuted }) => {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onMuteToggle} className="text-gray-400 hover:text-white transition-colors">
        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={isMuted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
};

export default VolumeControl;