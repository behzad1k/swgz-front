import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/router/hooks';
import { X, Play, Shuffle, Edit2, Plus } from '@/assets/svg';
import Button from '@/components/common/Button';
import { playlistApi } from '@/api/playlist.api';
import { Playlist, Track } from '@/types/models.ts';
import SongItem from '@/components/music/SongItem';
import { useTrackActions } from '@/hooks/useTrackActions';
import { usePlayerActions } from '@/hooks/actions/usePlayerActions';
import { useIsPlaying } from '@/hooks/selectors/usePlayerSelectors';
import { usePlaylistData } from '@/hooks/usePlaylistData';

const PlaylistDetailPage: FC = () => {
  const { slug } = useParams();
  const playlistProp = usePlaylistData(slug);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!playlistProp);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Track[]>([]);
  const { addToQueueButton } = useTrackActions();
  const { play, setQueue, setShuffle } = usePlayerActions();
  const isPlaying = useIsPlaying();

  // Determine if this playlist is editable (only user-created playlists)
  const isEditable = playlist?.isEditable ?? false;
  const isDefaultPlaylist = !!playlistProp;

  const onPlay = (track: Track) => {
    setQueue(songs.slice(songs.findIndex((e) => e.id == track.id)));
    play(track);
  };

  useEffect(() => {
    // If playlist prop is provided, use it (for default playlists)
    if (playlistProp) {
      setPlaylist(playlistProp);
      setSongs(playlistProp.songs.map((playlistSong) => playlistSong.song) || []);
      setLoading(false);
      return;
    }

    // Otherwise, load from API (for user-created playlists)
    if (slug) {
      loadPlaylist(slug);
    }
    setLoading(false);

    return () => {
      if (!playlistProp) {
        setPlaylist(null);
        setSongs([]);
      }
    };
  }, [slug, playlistProp]);

  const loadPlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      const data = await playlistApi.getPlaylist(playlistId);
      setPlaylist(data);
      setSongs(data.songs.map((playlistSong) => playlistSong.song) || []);
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs.length) {
      onPlay(songs[0]);
    }
  };

  const handleShuffle = () => {
    if (songs.length) {
      setShuffle(true);
      onPlay(songs[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading playlist...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Playlist not found</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col max-w-6xl mx-auto p-6 h-screen bg-background ${isPlaying ? 'pb-32' : 'pb-8'} overflow-y-auto`}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-400 hover:text-white transition-colors"
      >
        <img src={X} alt={getAltFromPath(X)} width={28} />
      </button>

      <div className="flex justify-center items-center gap-6 mb-3">
        <div className="relative group">
          <img
            src={
              playlist.coverUrl ||
              'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
            }
            alt={playlist.title}
            className="rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-5xl font-bold text-white mb-4">{playlist.title}</h1>
        <p className="text-gray-300 mb-2">{playlist.description}</p>
        <p className="text-gray-400">
          {songs.length} songs {playlist.isPublic ? '• Public' : '• Private'}
        </p>
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

        {/* Only show Edit and Add Songs buttons for editable playlists */}
        {isEditable && !isDefaultPlaylist && (
          <>
            <Button
              size="md"
              variant="secondary"
              icon={<img src={Edit2} alt={getAltFromPath(Edit2)} width={24} />}
              onClick={() => navigate(`/playlist/edit/${slug}`)}
            >
              <span className="w-10">Edit</span>
            </Button>
            <Button
              size="md"
              variant="secondary"
              icon={<img src={Plus} alt={getAltFromPath(Plus)} width={24} />}
            >
              <span className="w-14">Add Songs</span>
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2">
        {songs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No songs in this playlist yet</p>
            {isEditable && !isDefaultPlaylist && (
              <Button
                className="mt-4"
                icon={<img src={Plus} alt={getAltFromPath(Plus)} width={20} />}
              >
                Add Songs
              </Button>
            )}
          </div>
        ) : (
          songs.map((song, index) => (
            <SongItem
              key={song.id}
              song={song}
              onPlay={onPlay}
              actions={[addToQueueButton(song)]}
              index={index}
              draggable={false}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
