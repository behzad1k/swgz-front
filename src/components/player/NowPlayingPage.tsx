import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { FC, memo } from 'react';

interface NowPlayingPageProps {
  onClose: () => void;
}

const NowPlayingPage: FC<NowPlayingPageProps> = ({ onClose }) => {
  const { state, dispatch } = useApp();
  const { currentSong, isPlaying, progress, quality } = state.player;

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
        <button onClick={onClose} className="mb-6 text-gray-400 hover:text-white transition-colors self-start">
          <X size={28} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <img src={currentSong.coverUrl || 'https://via.placeholder.com/400'} alt={currentSong.title} className="w-full max-w-md aspect-square rounded-3xl shadow-2xl object-cover" />
          <div className="w-full text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">{currentSong.title}</h1>
            <p className="text-xl text-gray-300">{currentSong.artist}</p>
          </div>
          <div className="w-full space-y-2">
            <input type="range" min="0" max="100" value={progress} onChange={(e) => dispatch({ type: 'SET_PLAYER', payload: { progress: parseFloat(e.target.value) } })} className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer" />
          </div>
          <div className="flex items-center justify-center gap-8">
            <button className="p-4 hover:bg-white/10 rounded-full transition-colors">
              <SkipBack size={28} className="text-white" />
            </button>
            <button onClick={() => dispatch({ type: 'SET_PLAYER', payload: { isPlaying: !isPlaying } })} className="p-6 bg-white rounded-full hover:scale-110 transition-transform shadow-2xl">
              {isPlaying ? <Pause size={32} className="text-black" /> : <Play size={32} className="text-black fill-black" />}
            </button>
            <button className="p-4 hover:bg-white/10 rounded-full transition-colors">
              <SkipForward size={28} className="text-white" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Quality:</span>
            {(['128', '320', 'FLAC'] as const).map((q) => (
              <button key={q} onClick={() => dispatch({ type: 'SET_PLAYER', payload: { quality: q } })} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${quality === q ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(NowPlayingPage);