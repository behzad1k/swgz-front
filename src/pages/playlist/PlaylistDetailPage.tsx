import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/router/hooks';
import { X, Play, Shuffle, Edit2, MoveVertical, Plus } from '@/assets/svg';
import Button from '@/components/common/Button';
import { playlistApi } from '@/api/playlist.api';
import { Playlist, Track } from '@/types/models.ts';
import SongItem from '@/components/music/SongItem';
import { useTrackActions } from '@/hooks/useTrackActions';
import { usePlayerActions } from '@/hooks/actions/usePlayerActions';

const PlaylistDetailPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Track[]>([]);
  const { addToQueueButton } = useTrackActions();
  const { play, setQueue, setShuffle } = usePlayerActions();

  const onPlay = (track: Track) => {
    setQueue(songs.slice(songs.findIndex((e) => e.id == track.id)));
    play(track);
  };

  useEffect(() => {
    if (id) {
      loadPlaylist(id);
    }
    return () => {
      setPlaylist(null);
      setSongs([]);
    };
  }, [id]);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors"
        >
          <img src={X} alt={getAltFromPath(X)} width={28} />
        </button>

        <div className="flex items-end gap-6 mb-8">
          <div className="relative group">
            <img
              src={
                playlist.coverUrl ||
                'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
              }
              alt={playlist.title}
              className="w-52 h-52 rounded-2xl object-cover shadow-2xl"
            />
            <button className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <img src={Edit2} alt={getAltFromPath(Edit2)} width={32} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm uppercase mb-2">Playlist</p>
            <h1 className="text-5xl font-bold text-white mb-4">{playlist.title}</h1>
            <p className="text-gray-300 mb-2">{playlist.description}</p>
            <p className="text-gray-400">
              {songs.length} songs {playlist.isPublic ? 'Public' : 'Private'}
            </p>
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
          <Button
            size="md"
            variant="secondary"
            icon={<img src={Edit2} alt={getAltFromPath(Edit2)} width={24} />}
            onClick={() => navigate(`/playlist/edit/${id}`)}
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
          <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <img
              src={MoveVertical}
              alt={getAltFromPath(MoveVertical)}
              width={24}
              className="text-gray-400"
            />
          </button>
        </div>

        <div className="space-y-1">
          {songs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No songs in this playlist yet</p>
              <Button
                className="mt-4"
                icon={<img src={Plus} alt={getAltFromPath(Plus)} width={20} />}
              >
                Add Songs
              </Button>
            </div>
          ) : (
            songs.map((song, index) => (
              <SongItem
                key={song.id}
                song={song}
                onPlay={onPlay} // Disable play in edit mode
                actions={[addToQueueButton(song)]}
                index={index}
                draggable={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
