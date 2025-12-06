import { useNavigate, useParams } from '@/router';
import { Album, Track } from '@/types/models.ts';
import { musicApi } from '@api/music.api.ts';
import SongList from '@components/music/SongList.tsx';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { X } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useEffect, useState } from 'react';

const AlbumPage: FC = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [_loading, setLoading] = useState(false);
  const { play, setQueue } = usePlayerActions()
  const navigate = useNavigate()

  const onPlay = (track: Track) => {
    if (album?.songs) setQueue(album?.songs?.filter(e => e.id != track.id))
    play(track)
  };

  const fetchAlbum = async () => {
    setLoading(true);

    const response = await musicApi.getAlbum(id);

    setAlbum(response)
  }

  useEffect(() => {
    if (id) fetchAlbum()
  }, [id])

  if (!album) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-white transition-colors">
          <img src={X} alt={getAltFromPath(X)} width={28} onClick={() => navigate(-1)} />
        </button>
        <div className="flex flex-col items-start gap-6 mb-8">
          <img src={album.albumCover} alt={album.title} className="rounded-2xl object-cover shadow-2xl" />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Album</p>
            <h1 className="text-5xl font-bold text-white mb-4">{album.title}</h1>
            <p className="text-xl text-gray-300 mb-2">{album.artistName}</p>
            <p className="text-gray-400">{album.releaseDate} / {album.songs?.length} tracks</p>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Songs</h2>
          <SongList songs={album?.songs?.sort((a, b) => b.externalListens - a.externalListens) || []} onPlay={onPlay} />
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;