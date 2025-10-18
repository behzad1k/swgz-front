import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useCurrentSong, useIsPlaying, usePlayerProgress } from '@hooks/selectors/usePlayerSelectors.ts';
import { Pause, Play } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

interface MiniPlayerProps {
  onClick: () => void;
}

const MiniPlayer: FC<MiniPlayerProps> = ({ onClick }) => {
  const currentSong = useCurrentSong()
  const isPlaying = useIsPlaying();
  const progress = usePlayerProgress()
  const { togglePlay } = usePlayerActions()

  if (!currentSong) return null;

  return (
    <div onClick={onClick} className="fixed bottom-20 left-0 right-0 mx-4 mb-2 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-40 cursor-pointer">
      <div className="flex items-center gap-4 p-3">
        <img src={currentSong?.albumCover || 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'} alt={currentSong.title} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{currentSong.title}</h4>
          <p className="text-gray-300 text-xs truncate">{currentSong.artistName}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); togglePlay() }} className="p-2">
          {isPlaying ? <img src={Pause} alt={getAltFromPath(Pause)} width={24} className="text-white" /> : <img src={Play} alt={getAltFromPath(Play)} width={24} className="text-white fill-white" />}
        </button>
      </div>
      <div className="h-1 bg-white/20">
        <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default MiniPlayer;