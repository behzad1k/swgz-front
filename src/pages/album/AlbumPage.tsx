import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';


interface AlbumPageProps {
  albumId: string;
  onClose: () => void;
}

const AlbumPage: FC<AlbumPageProps> = ({ albumId, onClose }) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const { dispatch } = useApp();

  useEffect(() => {
    setAlbum({
      id: albumId,
      name: 'Sample Album',
      artist: 'Sample Artist',
      year: 2024,
      coverUrl: 'https://via.placeholder.com/400',
      totalTracks: 12,
      songs: [
        { id: '1', title: 'Track 1', artist: 'Sample Artist', duration: 240, trackNumber: 1, coverUrl: 'https://via.placeholder.com/60' },
      ],
    });
  }, [albumId]);

  if (!album) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={onClose} className="mb-6 text-gray-400 hover:text-white transition-colors">
          <X size={28} />
        </button>
        <div className="flex items-end gap-6 mb-8">
          <img src={album.coverUrl} alt={album.name} className="w-64 h-64 rounded-2xl object-cover shadow-2xl" />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Album</p>
            <h1 className="text-5xl font-bold text-white mb-4">{album.name}</h1>
            <p className="text-xl text-gray-300 mb-2">{album.artist}</p>
            <p className="text-gray-400">{album.year} • {album.totalTracks} tracks</p>
          </div>
        </div>
        <div className="space-y-2">
          {album.songs?.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              onPlay={(s) => dispatch({ type: 'SET_PLAYER', payload: { currentSong: s } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;