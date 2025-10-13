import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/router/hooks';
import { X, Play, Shuffle, Edit2, MoreVertical, Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import DraggableSongItem from '@/components/music/DraggableSongItem';
import { playlistApi } from '@/api/playlist.api';
import { Playlist, Track } from '@/types/models.ts';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

const PlaylistDetailPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  const { items: songs, setItems: setSongs, handleDragStart, handleDragOver, handleDrop } = useDragAndDrop<Track>([]);

  useEffect(() => {
    if (id) {
      loadPlaylist(id);
    }
  }, [id]);

  const loadPlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      const data = await playlistApi.getPlaylist(playlistId);
      setPlaylist(data);
      setSongs(data.songs || []);
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    // TODO: Implement play all functionality
    console.log('Playing all songs');
  };

  const handleShuffle = () => {
    // TODO: Implement shuffle functionality
    console.log('Shuffling playlist');
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
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-white transition-colors">
          <X size={28} />
        </button>

        {/* Header */}
        <div className="flex items-end gap-6 mb-8">
          <div className="relative group">
            <img
              src={playlist.coverUrl || 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'}
              alt={playlist.name}
              className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
            />
            <button className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 size={32} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm uppercase mb-2">Playlist</p>
            <h1 className="text-5xl font-bold text-white mb-4">{playlist.name}</h1>
            <p className="text-gray-300 mb-2">{playlist.description}</p>
            <p className="text-gray-400">
              {songs.length} songs • {playlist.isPublic ? 'Public' : 'Private'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button size="lg" icon={<Play size={24} className="fill-white" />} onClick={handlePlayAll}>
            Play All
          </Button>
          <Button size="lg" variant="secondary" icon={<Shuffle size={24} />} onClick={handleShuffle}>
            Shuffle
          </Button>
          <Button
            size="lg"
            variant="secondary"
            icon={<Edit2 size={24} />}
            onClick={() => navigate(`/playlist/${id}/edit`)}
          >
            Edit
          </Button>
          <Button size="lg" variant="secondary" icon={<Plus size={24} />}>
            Add Songs
          </Button>
          <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Song List with Drag and Drop */}
        <div className="space-y-1">
          {songs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No songs in this playlist yet</p>
              <Button className="mt-4" icon={<Plus size={20} />}>
                Add Songs
              </Button>
            </div>
          ) : (
            songs.map((song, index) => (
              <DraggableSongItem
                key={song.id}
                song={song}
                index={index}
                onPlay={() => {}}
                onLike={() => {}}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;