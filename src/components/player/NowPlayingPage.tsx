import { useApp } from '@/contexts/AppContext.tsx';
import PlayerControls from '@components/player/PlayerControls.tsx';
import ProgressBar from '@components/player/ProgressBar.tsx';
import QueueList from '@components/player/QueueList.tsx';
import VolumeControl from '@components/player/VolumeControl.tsx';
import { X } from 'lucide-react';
import { FC, memo } from 'react';

interface NowPlayingPageProps {
  onClose: () => void;
}

const NowPlayingPage: FC<NowPlayingPageProps> = ({ onClose }) => {
  const { player } = useApp();
  const { currentSong, isPlaying, progress, quality, seek, togglePlay, changeQuality, playNext, playPrevious, play, queue, volume, changeVolume } = player

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
        <button onClick={onClose} className="mb-6 text-gray-400 hover:text-white transition-colors self-start">
          <X size={28} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <img src={currentSong.albumCover || 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'} alt={currentSong.title} className="w-full max-w-md aspect-square rounded-3xl shadow-2xl object-cover" />
          <div className="w-full text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">{currentSong.title}</h1>
            <p className="text-xl text-gray-300">{currentSong.artistName}</p>
            <p className="text-xl text-gray-300">{currentSong.albumName}</p>
          </div>
          <ProgressBar progress={progress} duration={currentSong.duration} onSeek={seek} />
          <PlayerControls isPlaying={isPlaying} onPlayPause={togglePlay} onNext={playNext} onPrevious={playPrevious} />
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Quality:</span>
            {(['128', '320', 'FLAC'] as const).map((q) => (
              <button key={q} onClick={() => changeQuality(q)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${quality === q ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                {q}
              </button>
            ))}
          </div>
          <VolumeControl volume={volume} onVolumeChange={changeVolume} onMuteToggle={() => changeVolume(volume == 0 ? 70 : 0)} isMuted={volume == 0} />
          <QueueList queue={queue} onPlay={play}/>
        </div>
      </div>
    </div>
  );
};

export default memo(NowPlayingPage);