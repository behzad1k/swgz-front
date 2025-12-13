import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@/router/hooks';
import { X, Upload, MoveVertical, ListMinus } from '@/assets/svg';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import SongItem from '@/components/music/SongItem';
import { playlistApi } from '@/api/playlist.api';
import { Playlist, Track } from '@/types/models.ts';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { routes } from '@/config/routes.config';
import { useIsPlaying } from '@/hooks/selectors/usePlayerSelectors';
import { TrackAction } from '@/types/global';

const EditPlaylistPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPlaying = useIsPlaying();

  const {
    items: songs,
    setItems: setSongs,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop<Track>([]);

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
      setName(data.title);
      setDescription(data.description || '');

      if (data.coverUrl) {
        setCoverPreview(data.coverUrl);
      }

      setSongs(data.songs.map((e) => e.song) || []);
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this playlist? This action cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await playlistApi.deletePlaylist(id);
      setPlaylist(null);
      setSongs([]);
      setName('');
      setDescription('');
      setCoverImage(null);
      setCoverPreview(null);

      navigate(routes.root.path);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setCoverImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    try {
      // Update playlist metadata
      await playlistApi.updatePlaylist(id, { name, description });

      // Upload cover image if changed
      if (coverImage) {
        const formData = new FormData();
        formData.append('cover', coverImage);
        await playlistApi.uploadCover(id, formData);
      }

      // Update song order (send all song IDs in current order)
      const songIds = songs.map((s) => s.id);
      if (songIds.length > 0) {
        await playlistApi.updateSongOrder(id, songIds);
      }

      navigate(`/playlist/get/${id}`);
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = async (songId: string, _e: React.MouseEvent) => {
    if (!id || !songId) return;

    if (!window.confirm('Remove this song from the playlist?')) {
      return;
    }

    try {
      await playlistApi.removeSong(id, songId);
      setSongs(songs.filter((s) => s.id !== songId));
    } catch (error) {
      console.error('Error removing song:', error);
      alert('Failed to remove song. Please try again.');
    }
  };

  const handleRemoveCover = async () => {
    if (!id) return;

    if (!window.confirm('Remove playlist cover image?')) {
      return;
    }

    try {
      await playlistApi.deleteCover(id);
      setCoverImage(null);
      setCoverPreview(null);
    } catch (error) {
      console.error('Error removing cover:', error);
      alert('Failed to remove cover. Please try again.');
    }
  };

  if (loading && !playlist) {
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Playlist</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <img src={X} alt={getAltFromPath(X)} width={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-48 h-48 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors"
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <img
                      src={Upload}
                      alt={getAltFromPath(Upload)}
                      width={32}
                      className="text-white"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={Upload}
                    alt={getAltFromPath(Upload)}
                    width={48}
                    className="text-gray-400"
                  />
                </div>
              )}
            </button>
            {coverPreview && (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <img src={X} alt="Remove" width={16} />
              </button>
            )}
            <p className="text-center text-gray-400 text-sm mt-2">Click to change cover image</p>
          </div>
        </div>

        {/* Playlist Info */}
        <Input placeholder="Playlist name" value={name} onChange={setName} />

        <div>
          <label className="text-gray-300 mb-2 block">Description</label>
          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
          />
        </div>

        {/* Delete Playlist Button */}
        <Button
          type="button"
          variant="custom"
          className="bg-red-500 hover:bg-red-600 text-white w-full"
          icon={<img src={ListMinus} alt={getAltFromPath(ListMinus)} width={16} />}
          onClick={handleDeletePlaylist}
          disabled={loading}
        >
          Delete Playlist
        </Button>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-300 font-semibold">Songs ({songs.length})</label>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <img src={MoveVertical} alt={getAltFromPath(MoveVertical)} width={16} />
              <span>Drag to reorder</span>
            </div>
          </div>

          <div className="space-y-2">
            {songs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No songs in this playlist</p>
              </div>
            ) : (
              songs.map((song, index) => (
                <SongItem
                  key={song.id}
                  song={song}
                  onPlay={() => {}} // Disable play in edit mode
                  actions={[
                    {
                      icon: ListMinus,
                      alt: getAltFromPath(ListMinus) || '',
                      onClick: (e) => handleRemoveSong(song.id || '', e),
                      tooltip: 'Remove From Playlist',
                    },
                  ]}
                  index={index}
                  draggable={true}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  showDragHandle={true}
                />
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0">
          <Button type="submit" className="flex-1" disabled={loading || !name.trim()}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPlaylistPage;
