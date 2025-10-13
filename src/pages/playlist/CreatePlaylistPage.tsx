import { FC, useState } from 'react';
import { useNavigate } from '@/router/hooks';
import { X } from 'lucide-react';
import CreatePlaylistForm from '@/components/forms/CreatePlaylistForm';
import { playlistApi } from '@/api/playlist.api';

const CreatePlaylistPage: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (name: string, description: string, coverImage?: File) => {
    console.log(coverImage);
    setLoading(true);
    try {
      const playlist = await playlistApi.createPlaylist({ name, description });
      // TODO: Upload cover image if provided
      navigate(`/playlist/${playlist.id}`);
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Create Playlist</h1>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-8">
          <CreatePlaylistForm onSubmit={handleCreate} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistPage;