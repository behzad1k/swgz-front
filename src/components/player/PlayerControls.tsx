import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
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
        <button
          onClick={onShuffle}
          className={`p-2 rounded-full transition-colors ${shuffle ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
        >
          <img src={Shuffle} alt={getAltFromPath(Shuffle)} width={20} />
        </button>
      )}
      <button onClick={onPrevious} className="p-3 hover:bg-white/10 rounded-full transition-colors">
        <img src={SkipBack} alt={getAltFromPath(SkipBack)} width={24} className="text-white" />
      </button>
      <button
        onClick={onPlayPause}
        className="p-4 bg-white rounded-full hover:scale-110 transition-transform shadow-lg"
      >
        {isPlaying ? (
          <img
            src={Pause}
            alt={getAltFromPath(Pause)}
            width={28}
            className="stroke-black fill-black"
          />
        ) : (
          <img src={Play} alt={getAltFromPath(Play)} width={28} className="" />
        )}
      </button>
      <button onClick={onNext} className="p-3 hover:bg-white/10 rounded-full transition-colors">
        <img
          src={SkipForward}
          alt={getAltFromPath(SkipForward)}
          width={24}
          className="text-white"
        />
      </button>
      {onRepeat && (
        <button
          onClick={onRepeat}
          className={`p-2 rounded-full transition-colors ${repeat ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
        >
          <img src={Repeat} alt={getAltFromPath(Repeat)} width={20} />
        </button>
      )}
    </div>
  );
};

export default PlayerControls;
