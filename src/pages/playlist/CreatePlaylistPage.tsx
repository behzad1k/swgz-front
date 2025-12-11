import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useRef } from 'react';
import { useNavigate } from '@/router/hooks';
import { X, Upload } from '@/assets/svg';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { playlistApi } from '@/api/playlist.api';

const CreatePlaylistPage: FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    setLoading(true);
    try {
      const playlist = await playlistApi.createPlaylist({
        name: name.trim(),
        description: description.trim(),
      });

      // Upload cover image if provided
      if (coverImage) {
        const formData = new FormData();
        formData.append('cover', coverImage);
        await playlistApi.uploadCover(playlist.id, formData);
      }

      navigate(`/playlist/get/${playlist.id}`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Create Playlist</h1>
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
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
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
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <img
                      src={Upload}
                      alt={getAltFromPath(Upload)}
                      width={48}
                      className="text-gray-400"
                    />
                    <span className="text-gray-400 text-sm">Upload cover</span>
                  </div>
                )}
              </button>
              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <img src={X} alt={getAltFromPath(X)} width={16} className="text-white" />
                </button>
              )}
              <p className="text-center text-gray-400 text-sm mt-2">
                {coverPreview ? 'Click to change' : 'Optional'}
              </p>
            </div>
          </div>

          {/* Playlist Name */}
          <div>
            <label className="text-gray-300 mb-2 block">Playlist Name *</label>
            <Input placeholder="My Awesome Playlist" value={name} onChange={setName} />
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-300 mb-2 block">Description (Optional)</label>
            <textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Playlist'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistPage;
