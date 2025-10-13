import { FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/router/hooks';
import { X, Upload } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { playlistApi } from '@/api/playlist.api';
import { Playlist } from '@/types/models.ts';

const EditPlaylistPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlaylist(id);
    }
  }, [id]);

  const loadPlaylist = async (playlistId: string) => {
    try {
      const data = await playlistApi.getPlaylist(playlistId);
      setPlaylist(data);
      setName(data.name);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    try {
      await playlistApi.updatePlaylist(id, { name, description });
      // TODO: Upload cover image if changed
      navigate(`/playlist/${id}`);
    } catch (error) {
      console.error('Error updating playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Playlist</h1>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
              <label className="cursor-pointer">
                <div className="w-48 h-48 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors relative overflow-hidden">
                  {coverImage || playlist.coverUrl ? (
                    <img
                      src={coverImage ? URL.createObjectURL(coverImage) : playlist.coverUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload size={48} className="text-gray-400" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <Input placeholder="My Awesome Playlist" value={name} onChange={setName} />

            <div>
              <label className="text-gray-300 mb-2 block">Description</label>
              <textarea
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading || !name}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistPage;