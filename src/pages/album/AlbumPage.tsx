import { useApp } from '@/contexts/AppContext.tsx';
import { useNavigate, useParams } from '@/router';
import { Album } from '@/types/models.ts';
import { musicApi } from '@api/music.api.ts';
import SongItem from '@components/music/SongItem.tsx';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';


const AlbumPage: FC = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [_loading, setLoading] = useState(false);
  const { player } = useApp();
  const navigate = useNavigate()

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
          <X size={28} />
        </button>
        <div className="flex items-end gap-6 mb-8">
          <img src={album.albumCover} alt={album.title} className="w-64 h-64 rounded-2xl object-cover shadow-2xl" />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Album</p>
            <h1 className="text-5xl font-bold text-white mb-4">{album.title}</h1>
            <p className="text-xl text-gray-300 mb-2">{album.artistName}</p>
            <p className="text-gray-400">{album.releaseDate} • {album.totalTracks} tracks</p>
          </div>
        </div>
        <div className="space-y-2">
          {album.songs?.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              onPlay={player.play}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;