import { buildPath, routes } from '@/config/routes.config.ts';
import { useNavigate, useParams } from '@/router';
import { Artist, Track } from '@/types/models.ts';
import { musicApi } from '@api/music.api.ts';
import Button from '@components/common/Button.tsx';
import AlbumCard from '@components/music/AlbumCard.tsx';
import SongList from '@components/music/SongList.tsx';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { X, Play, Shuffle } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useEffect, useState } from 'react';

const ArtistPage: FC = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [_loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { play, setQueue, setShuffle } = usePlayerActions();

  const onPlay = (track: Track) => {
    if (artist?.songs) setQueue(artist?.songs?.filter((e) => e.id != track.id));
    play(track);
  };

  const fetchArtist = async () => {
    setLoading(true);

    const response = await musicApi.getArtist(id);

    setArtist(response);

    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchArtist();
  }, [id]);

  useEffect(() => {
    return () => {
      console.log('existing');
      setArtist(null);
    };
  }, []);

  const handlePlayAll = () => {
    if (artist?.songs?.length) {
      onPlay(artist?.songs[0]);
    }
  };

  const handleShuffle = () => {
    if (artist?.songs?.length) {
      const firstSong = artist?.songs[Math.floor(Math.random() * artist?.songs.length)];
      setShuffle(
        true,
        artist?.songs.filter((e) => e.id != firstSong.id)
      );
      play(firstSong);
    }
  };

  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors">
          <img src={X} alt={getAltFromPath(X)} width={28} onClick={() => navigate(-1)} />
        </button>
        <div className="flex flex-col items-start gap-6 mb-8">
          <img
            src={artist?.pfp}
            alt={artist?.name}
            className="rounded-2xl object-cover shadow-2xl"
          />
          <div>
            <p className="text-gray-400 text-sm uppercase mb-2">Artist</p>
            <h1 className="text-6xl font-bold text-white mb-4">{artist?.name}</h1>
            <p className="text-gray-300 mb-4">
              {artist?.externalListeners?.toLocaleString()} listeners
            </p>
            <p className="text-gray-300 mb-4">{artist?.externalPlays?.toLocaleString()} plays</p>
            {/*<Button size="lg" disabled>
              Follow
            </Button>*/}
          </div>
        </div>
        <div className="flex gap-4 mb-8 text-xs">
          <Button
            size="md"
            icon={<img src={Play} alt={getAltFromPath(Play)} width={18} className="fill-white" />}
            onClick={handlePlayAll}
          >
            <span className="w-14">Play All</span>
          </Button>
          <Button
            size="md"
            variant="secondary"
            icon={<img src={Shuffle} alt={getAltFromPath(Shuffle)} width={24} />}
            onClick={handleShuffle}
          >
            <span className="w-12">Shuffle</span>
          </Button>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Songs</h2>
          <SongList
            songs={artist?.songs?.sort((a, b) => b.externalListens - a.externalListens)}
            onPlay={onPlay}
          />
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Albums</h2>
          <div className="grid grid-cols-2 gap-3">
            {artist?.albums?.map((album) => (
              <AlbumCard
                album={album}
                onClick={() => navigate(buildPath(routes.album, { id: album.id }))}
                key={album.id}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 text-left text-white">
          <h1 className="font-bold text-2xl">Biography</h1>
          <div dangerouslySetInnerHTML={{ __html: artist?.fullBio?.toString() || '' }} />
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
