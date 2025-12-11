import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { Plus, Search } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers';
import { FC, useState } from 'react';
import { Playlist } from '@/types/models';
import { playlistApi } from '@/api/playlist.api';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  songData: {
    id?: string;
    title: string;
    artistName: string;
    albumName?: string;
    albumCover?: string;
    duration?: number;
    mbid?: string;
    lastFMLink?: string;
  };
  onSuccess?: () => Promise<void>;
}

const AddToPlaylistModal: FC<AddToPlaylistModalProps> = ({
  onClose,
  playlists,
  songData,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToPlaylist = async (playlistId: string) => {
    setLoading(playlistId);
    try {
      await playlistApi.addSong(playlistId, {
        id: songData?.id,
        artist: songData.artistName,
        title: songData.title,
        mbid: songData.mbid,
        lastFMLink: songData.lastFMLink,
        album: songData.albumName,
      });
      await onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setCreatingPlaylist(true);
    try {
      const newPlaylist = await playlistApi.createPlaylist({
        name: newPlaylistName,
        description: '',
      });

      // Add song to the newly created playlist
      await playlistApi.addSong(newPlaylist.id, songData);

      await onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Song Info */}
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
        <img
          src={
            songData.albumCover ||
            'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'
          }
          alt={songData.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{songData.title}</h4>
          <p className="text-gray-400 text-sm truncate">{songData.artistName}</p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search playlists..."
        value={searchQuery}
        onChange={setSearchQuery}
        icon={<img src={Search} alt={getAltFromPath(Search)} width={18} />}
      />

      {/* Create New Playlist */}
      {showCreateNew ? (
        <div className="space-y-3 p-4 bg-white/5 rounded-xl">
          <Input
            placeholder="New playlist name"
            value={newPlaylistName}
            onChange={setNewPlaylistName}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistName.trim() || creatingPlaylist}
              className="flex-1"
            >
              {creatingPlaylist ? 'Creating...' : 'Create & Add'}
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateNew(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setShowCreateNew(true)}
          icon={<img src={Plus} alt={getAltFromPath(Plus)} width={18} />}
        >
          Create New Playlist
        </Button>
      )}

      {/* Playlists List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredPlaylists.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No playlists found</p>
          </div>
        ) : (
          filteredPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              disabled={loading === playlist.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <img
                src={
                  playlist.coverUrl ||
                  'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'
                }
                alt={playlist.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 text-left min-w-0">
                <h4 className="text-white font-medium truncate">{playlist.title}</h4>
                <p className="text-gray-400 text-sm">{playlist.songs?.length || 0} songs</p>
              </div>
              {loading === playlist.id && (
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
