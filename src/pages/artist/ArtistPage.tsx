import { useApp } from '@/contexts/AppContext.tsx';
import { useParams } from '@/router';
import { Artist, Track } from '@/types/models.ts';
import { musicApi } from '@api/music.api.ts';
import Button from '@components/common/Button.tsx';
import SongItem from '@components/music/SongItem.tsx';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';


const ArtistPage: FC = () => {
  const { id } = useParams()
  const [artist, setArtist] = useState<Artist | null>(null);
  const [topSongs, _setTopSongs] = useState<Track[]>([]);
  const [_loading, setLoading] = useState(false);
  const { player } = useApp();

  const fetchArtist = async () => {
    setLoading(true);

    const response = await musicApi.getArtist(id);
    setArtist(response)
  }

  useEffect(() => {
    if (id) fetchArtist()
  }, [])

  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors">
          <X size={28} />
        </button>
        <div className="flex flex-col items-end gap-6 mb-8">
          <img src={artist.image} alt={artist.name} className="w-64 h-64 rounded-2xl object-cover shadow-2xl" />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Artist</p>
            <h1 className="text-6xl font-bold text-white mb-4">{artist.name}</h1>
            <p className="text-gray-300 mb-4">{artist.externalListeners?.toLocaleString()} listeners</p>
            <p className="text-gray-300 mb-4">{artist.externalPlays?.toLocaleString()} plays</p>
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
                onPlay={player.play}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;