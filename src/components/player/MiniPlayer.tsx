import { Pause, Play } from 'lucide-react';
import { FC, memo } from 'react';

interface MiniPlayerProps {
  onClick: () => void;
}

const MiniPlayer: FC<MiniPlayerProps> = ({ onClick }) => {
  const { state, dispatch } = useApp();
  const { currentSong, isPlaying, progress } = state.player;

  if (!currentSong) return null;

  return (
    <div onClick={onClick} className="fixed bottom-20 left-0 right-0 mx-4 mb-2 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-40 cursor-pointer">
      <div className="flex items-center gap-4 p-3">
        <img src={currentSong.coverUrl || 'https://via.placeholder.com/60'} alt={currentSong.title} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{currentSong.title}</h4>
          <p className="text-gray-300 text-xs truncate">{currentSong.artist}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SET_PLAYER', payload: { isPlaying: !isPlaying } }); }} className="p-2">
          {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white fill-white" />}
        </button>
      </div>
      <div className="h-1 bg-white/20">
        <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default memo(MiniPlayer);