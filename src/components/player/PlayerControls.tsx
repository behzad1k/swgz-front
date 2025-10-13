import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { FC } from 'react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle?: () => void;
  onRepeat?: () => void;
  shuffle?: boolean;
  repeat?: boolean;
}

const PlayerControls: FC<PlayerControlsProps> = ({
                                                   isPlaying,
                                                   onPlayPause,
                                                   onNext,
                                                   onPrevious,
                                                   onShuffle,
                                                   onRepeat,
                                                   shuffle = false,
                                                   repeat = false,
                                                 }) => {
  return (
    <div className="flex items-center justify-center gap-6">
      {onShuffle && (
        <button onClick={onShuffle} className={`p-2 rounded-full transition-colors ${shuffle ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}>
          <Shuffle size={20} />
        </button>
      )}
      <button onClick={onPrevious} className="p-3 hover:bg-white/10 rounded-full transition-colors">
        <SkipBack size={24} className="text-white" />
      </button>
      <button onClick={onPlayPause} className="p-4 bg-white rounded-full hover:scale-110 transition-transform shadow-lg">
        {isPlaying ? <Pause size={28} className="text-black" /> : <Play size={28} className="text-black fill-black" />}
      </button>
      <button onClick={onNext} className="p-3 hover:bg-white/10 rounded-full transition-colors">
        <SkipForward size={24} className="text-white" />
      </button>
      {onRepeat && (
        <button onClick={onRepeat} className={`p-2 rounded-full transition-colors ${repeat ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}>
          <Repeat size={20} />
        </button>
      )}
    </div>
  );
};

export default PlayerControls;