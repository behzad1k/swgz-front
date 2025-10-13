import { useApp } from '@/contexts/AppContext.tsx';
import { Artist, Track } from '@/types/models.ts';
import Button from '@components/common/Button.tsx';
import SongItem from '@components/music/SongItem.tsx';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

interface ArtistPageProps {
  artistId: string;
  onClose: () => void;
}

const ArtistPage: FC<ArtistPageProps> = ({ artistId, onClose }) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [topSongs, setTopSongs] = useState<Track[]>([]);
  const { dispatch } = useApp();

  useEffect(() => {
    setArtist({
      id: artistId,
      name: 'Sample Artist',
      image: 'https://via.placeholder.com/400',
      bio: 'This is a sample artist bio.',
      followers: 1250000,
    });
    setTopSongs([
      { id: '1', title: 'Hit Song 1', artistName: 'Sample Artist', duration: 240, albumCover: 'https://via.placeholder.com/60' },
      { id: '2', title: 'Hit Song 2', artistName: 'Sample Artist', duration: 210, albumCover: 'https://via.placeholder.com/60' },
    ]);
  }, [artistId]);

  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={onClose} className="mb-6 text-gray-400 hover:text-white transition-colors">
          <X size={28} />
        </button>
        <div className="flex items-end gap-6 mb-8">
          <img src={artist.image} alt={artist.name} className="w-64 h-64 rounded-2xl object-cover shadow-2xl" />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Artist</p>
            <h1 className="text-6xl font-bold text-white mb-4">{artist.name}</h1>
            <p className="text-gray-300 mb-4">{artist.followers.toLocaleString()} followers</p>
            <Button size="lg">Follow</Button>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Songs</h2>
          <div className="space-y-2">
            {topSongs.map((song) => (
              <SongItem
                key={song.id}
                song={song}
                onPlay={(s) => dispatch({ type: 'SET_PLAYER', payload: { currentSong: s } })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;