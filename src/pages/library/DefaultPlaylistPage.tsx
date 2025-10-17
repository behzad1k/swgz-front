import SongList from '@/components/music/SongList';
import { useCurrentRoute, useNavigate, useParams } from '@/router';
import { Playlist } from '@/types/models.ts';
import { usePlaylistData } from '@hooks/usePlaylistData.ts';
import { ChevronLeft } from 'lucide-react';
import { FC } from 'react';

const DefaultPlaylistPage: FC = () => {
  const { slug } = useParams();
  const playlistData = usePlaylistData(slug);

  if (!slug) return null;

  return (
    <div className="h-screen flex">
      <DefaultPlaylist playList={playlistData}/>
    </div>
  );
};

type Props = {
  playList: Playlist;
}

const DefaultPlaylist: FC<Props> = ({ playList }: Props) => {
  const navigate = useNavigate();
  const currentRoute = useCurrentRoute();
  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        {currentRoute?.headerBackButton && <ChevronLeft size={40} color={'grey'} onClick={() => navigate(-1)}/>}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <img src={playList.coverUrl}/>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">{playList.title}</h1>
          <p className="text-gray-400">Your top tracks</p>
        </div>
      </div>
      <SongList songs={playList.songs}/>
    </div>
  );
};

export default DefaultPlaylistPage;