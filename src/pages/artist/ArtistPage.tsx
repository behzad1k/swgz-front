import { buildPath, routes } from '@/config/routes.config.ts';
import { useNavigate, useParams } from '@/router';
import { Artist, Track } from '@/types/models.ts';
import { musicApi } from '@api/music.api.ts';
import Button from '@components/common/Button.tsx';
import AlbumCard from '@components/music/AlbumCard.tsx';
import SongList from '@components/music/SongList.tsx';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { X } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useEffect, useState } from 'react';


const ArtistPage: FC = () => {
  const { id } = useParams()
  const [artist, setArtist] = useState<Artist | null>(null);
  const [_loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const { play, setQueue } = usePlayerActions()

  const onPlay = (track: Track) => {
    if (artist?.songs) setQueue(artist?.songs?.filter(e => e.id != track.id))
    play(track)
  };

  const fetchArtist = async () => {
    setLoading(true);

    const response = await musicApi.getArtist(id);

    setArtist(response)

    setLoading(false);
  }

  useEffect(() => {
    if (id) fetchArtist()
  }, [id])

  useEffect(() => {
    return () => {
      console.log('existing');
      setArtist(null)
    }
  }, [])

  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors">
          <img src={X} alt={getAltFromPath(X)} width={28} onClick={() => navigate(-1)} />
        </button>
        <div className="flex flex-col items-start gap-6 mb-8">
          <img src={artist?.pfp} alt={artist?.name} className="rounded-2xl object-cover shadow-2xl" />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Artist</p>
            <h1 className="text-6xl font-bold text-white mb-4">{artist?.name}</h1>
            <p className="text-gray-300 mb-4">{artist?.externalListeners?.toLocaleString()} listeners</p>
            <p className="text-gray-300 mb-4">{artist?.externalPlays?.toLocaleString()} plays</p>
            <Button size="lg" disabled>Follow</Button>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Songs</h2>
          <SongList songs={artist?.songs?.sort((a, b) => b.externalListens - a.externalListens)} onPlay={onPlay} />
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Albums</h2>
          <div className="grid grid-cols-2">
            {artist?.albums?.map((album) =>
              <AlbumCard album={album} onClick={() => navigate(buildPath(routes.album, { id: album.id }))} key={album.id}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;