import SongList from '@components/music/SongList.tsx';
import { useCurrentRoute, useNavigate, useParams } from '@/router';
import { PlaylistDefault, Track } from '@/types/models.ts';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useIsPlaying } from '@hooks/selectors/usePlayerSelectors.ts';
import { usePlaylistData } from '@hooks/usePlaylistData.ts';
import { ChevronLeft } from '@assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useEffect } from 'react';

const DefaultPlaylistPage: FC = () => {
  const { slug } = useParams();
  const playlistData = usePlaylistData(slug);
  const isPlaying = useIsPlaying();

  useEffect(() => {
    console.log(slug);
  }, [slug]);
  if (!slug) return null;

  return (
    <div className={`h-screen flex${isPlaying ? ' pb-28' : ''}`}>
      <DefaultPlaylist playList={playlistData} />
    </div>
  );
};

type Props = {
  playList: PlaylistDefault;
};

const DefaultPlaylist: FC<Props> = ({ playList }: Props) => {
  const navigate = useNavigate();
  const currentRoute = useCurrentRoute();
  const { play, setQueue } = usePlayerActions();
  const onPlay = (track: Track) => {
    setQueue(playList.songs.slice(playList.songs.findIndex((e) => e.id == track.id)));
    play(track);
  };

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        {currentRoute?.headerBackButton && (
          <img
            src={ChevronLeft}
            alt={getAltFromPath(ChevronLeft)}
            width={40}
            className="text-gray-400"
            onClick={() => navigate(-1)}
          />
        )}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <img src={playList.coverUrl} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">{playList.title}</h1>
          <p className="text-gray-400">Your top tracks</p>
        </div>
      </div>
      <SongList songs={playList.songs} onPlay={onPlay} />
    </div>
  );
};

export default DefaultPlaylistPage;
