import PlayerControls from '@/components/player/PlayerControls';
import ProgressBar from '@/components/player/ProgressBar';
import QueueList from '@/components/player/QueueList';
import VolumeControl from '@/components/player/VolumeControl';
import Button from '@components/common/Button.tsx';
import { DownloadProgress } from '@components/player/DownloadProgress.tsx';
import QualitySelector from '@components/player/QualitySelector.tsx';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useCurrentUser } from '@hooks/selectors/useAuthSelectors.ts';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerProgress,
  usePlayerQuality,
  usePlayerRepeat,
  usePlayerShuffle,
  usePlayerVolume,
  useQueue,
  useSongDuration,
} from '@hooks/selectors/usePlayerSelectors.ts';
import { useModal } from '@hooks/useModal.ts';
import { ChevronDown, ChevronUp } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, memo, useState, useRef, useEffect } from 'react';

type SheetState = 'closed' | 'mini' | 'half' | 'full';

const NowPlayingSheet: FC = () => {
  const [sheetState, setSheetState] = useState<SheetState>('mini');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { openModal, closeModal } = useModal();
  const user = useCurrentUser();
  const {
    seek,
    togglePlay,
    changeQuality,
    playNext,
    playPrevious,
    play,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerActions();
  const isPremium = user?.subscriptionPlan === 'premium';

  // hooks
  const repeat = usePlayerRepeat();
  const shuffle = usePlayerShuffle();
  const queue = useQueue();
  const duration = useSongDuration();
  const volume = usePlayerVolume();
  const progress = usePlayerProgress();
  const quality = usePlayerQuality();
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Don't show if no song
  if (!currentSong) return null;

  // Desktop sidebar version
  if (isDesktop) {
    return <DesktopNowPlaying />;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (sheetState === 'closed') return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const newY = e.touches[0].clientY;
    setCurrentY(newY);
    setDragOffset(newY - startY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;
    const threshold = 80;

    // Swipe down
    if (deltaY > threshold) {
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('mini');
      else if (sheetState === 'mini') setSheetState('closed');
    }
    // Swipe up
    else if (deltaY < -threshold) {
      if (sheetState === 'closed') setSheetState('mini');
      else if (sheetState === 'mini') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    }

    setStartY(0);
    setCurrentY(0);
    setDragOffset(0);
  };

  const getSheetHeight = () => {
    if (sheetState === 'closed') return '0';
    if (sheetState === 'mini') return '120px';
    if (sheetState === 'half') return '80vh';
    return '100vh';
  };

  const getTransform = () => {
    // When closed, translate fully off screen
    if (sheetState === 'closed' && !isDragging) return 'translateY(100%)';

    if (!isDragging || dragOffset === 0) return 'translateY(0)';
    // Only allow downward drag
    const clampedOffset = Math.max(0, dragOffset);
    return `translateY(${clampedOffset}px)`;
  };

  const getOpacity = () => {
    if (sheetState === 'closed') return 0;
    if (sheetState === 'mini') return 0;
    if (isDragging && dragOffset > 0) {
      return Math.max(0, 0.6 - dragOffset / 500);
    }
    return 0.6;
  };

  return (
    <>
      {(sheetState === 'half' || sheetState === 'full') && (
        <div
          className="fixed inset-0 bg-black z-40 transition-opacity duration-300"
          style={{ opacity: getOpacity() }}
          onClick={() => setSheetState('mini')}
        />
      )}

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 shadow-2xl z-50 rounded-t-3xl overflow-hidden"
        style={{
          height: getSheetHeight(),
          transform: getTransform(),
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-500 rounded-full" />
        </div>

        {sheetState === 'mini' && (
          <>
            <div
              className="flex items-center px-4 py-2 gap-3 cursor-pointer"
              onClick={() => setSheetState('half')}
            >
              <img
                src={
                  currentSong.albumCover ||
                  'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
                }
                alt={currentSong.title}
                className="w-14 h-14 rounded-lg shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">{currentSong.title}</h4>
                <p className="text-sm text-gray-400 truncate">{currentSong.artistName}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-10 h-10 flex items-center justify-center text-black hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playNext();
                }}
                className="text-white hover:scale-110 transition-transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4l12 8-12 8V4zm13 0v16h2V4h-2z" />
                </svg>
              </button>
            </div>
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </>
        )}

        {(sheetState === 'half' || sheetState === 'full') && (
          <div className="flex flex-col h-full overflow-y-auto pb-6">
            <button
              onClick={() => setSheetState('mini')}
              className="self-center mb-2 text-gray-400 hover:text-white transition-colors"
            >
              <img src={ChevronDown} alt={getAltFromPath(ChevronDown)} width={28} />
            </button>

            <div className="flex justify-center px-6 mb-6">
              <img
                src={
                  currentSong.albumCover ||
                  'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
                }
                alt={currentSong.title}
                className="w-full max-w-sm aspect-square rounded-2xl shadow-2xl object-cover"
              />
            </div>

            <div className="px-6 mb-6 text-center">
              <h1 className="text-2xl font-bold text-white mb-2">{currentSong.title}</h1>
              <p className="text-lg text-gray-300">{currentSong.artistName}</p>
              <p className="text-md text-gray-400">{currentSong.albumName}</p>
            </div>

            <div className="px-6 mb-6">
              <ProgressBar
                progress={progress}
                duration={duration || currentSong.duration || 666}
                onSeek={seek}
              />
            </div>

            <div className="px-6 mb-6">
              <PlayerControls
                isPlaying={isPlaying}
                onPlayPause={togglePlay}
                onNext={playNext}
                onPrevious={playPrevious}
                onShuffle={toggleShuffle}
                onRepeat={toggleRepeat}
                repeat={repeat}
                shuffle={shuffle}
              />
            </div>

            {sheetState === 'full' && (
              <>
                <Button
                  size={'md'}
                  className={'btn-primary'}
                  onClick={() =>
                    openModal({
                      id: 'QualityChange',
                      animation: 'slideUp',
                      size: 'lg',
                      onClose: () => closeModal('QualityChange'),
                      component: QualitySelector,
                      props: {
                        songId: currentSong.id,
                        onQualityChange: changeQuality,
                        quality,
                        isPremium,
                      },
                      closeOnOverlayClick: true,
                      closeOnEscape: true,
                    })
                  }
                >
                  quality
                </Button>

                <div className="px-6 mb-6">
                  <VolumeControl
                    volume={volume}
                    onVolumeChange={changeVolume}
                    onMuteToggle={() => changeVolume(volume === 0 ? 70 : 0)}
                    isMuted={volume === 0}
                  />
                </div>

                {/* Queue */}
                <div className="px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Up Next</h3>
                    <button
                      onClick={() => setSheetState('half')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <img src={ChevronUp} alt={getAltFromPath(ChevronUp)} width={24} />
                    </button>
                  </div>
                  <QueueList queue={queue} onPlay={play} />
                </div>
              </>
            )}

            {/* Expand to Full Button (only in half state) */}
            {sheetState === 'half' && (
              <button
                onClick={() => setSheetState('full')}
                className="mt-6 mx-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors"
              >
                Show Queue & More
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Desktop Sidebar Version
const DesktopNowPlaying: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    seek,
    togglePlay,
    changeQuality,
    playNext,
    playPrevious,
    play,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerActions();

  // hooks
  const repeat = usePlayerRepeat();
  const shuffle = usePlayerShuffle();
  const duration = useSongDuration();
  const queue = useQueue();
  const volume = usePlayerVolume();
  const progress = usePlayerProgress();
  const quality = usePlayerQuality();
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();

  if (!currentSong) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 shadow-2xl transition-all duration-300 z-40 ${
        isExpanded ? 'w-96' : 'w-20'
      }`}
    >
      {isExpanded ? (
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <button
            onClick={() => setIsExpanded(false)}
            className="self-end mb-4 text-gray-400 hover:text-white transition-colors"
          >
            <img src={ChevronDown} alt={getAltFromPath(ChevronDown)} width={24} />
          </button>

          <img
            src={
              currentSong.albumCover ||
              'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
            }
            alt={currentSong.title}
            className="w-full aspect-square rounded-lg shadow-2xl mb-4 object-cover"
          />

          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-1">{currentSong.title}</h3>
            <p className="text-gray-300 mb-1">{currentSong.artistName}</p>
            <p className="text-sm text-gray-400">{currentSong.albumName}</p>
          </div>
          <DownloadProgress />

          <div className="mb-4">
            <ProgressBar
              progress={progress}
              duration={duration || currentSong.duration || 666}
              onSeek={seek}
            />
          </div>

          <div className="mb-4">
            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={togglePlay}
              onNext={playNext}
              onPrevious={playPrevious}
              shuffle={shuffle}
              repeat={repeat}
              onRepeat={toggleRepeat}
              onShuffle={toggleShuffle}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-400 text-xs">Quality:</span>
              {(['128', '320', 'flac'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => changeQuality(q)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    quality === q
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <VolumeControl
              volume={volume}
              onVolumeChange={changeVolume}
              onMuteToggle={() => changeVolume(volume === 0 ? 70 : 0)}
              isMuted={volume === 0}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <h4 className="text-sm font-bold text-white mb-2">Up Next</h4>
            <QueueList queue={queue} onPlay={play} />
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <img
            src={
              currentSong.albumCover ||
              'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
            }
            alt={currentSong.title}
            className="w-12 h-12 rounded-md mb-3 shadow-lg"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="text-white hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(NowPlayingSheet);
