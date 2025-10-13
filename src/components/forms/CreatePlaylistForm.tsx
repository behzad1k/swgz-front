import { FC, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Upload } from 'lucide-react';

interface CreatePlaylistFormProps {
  onSubmit: (name: string, description: string, coverImage?: File) => void;
  loading?: boolean;
}

const CreatePlaylistForm: FC<CreatePlaylistFormProps> = ({ onSubmit, loading = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description, coverImage || undefined);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center mb-4">
        <label className="cursor-pointer">
          <div className="w-32 h-32 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            {coverImage ? (
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Cover"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Upload size={32} className="text-gray-400" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <Input
        placeholder="Playlist name"
        value={name}
        onChange={setName}
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
      />
      <Button type="submit" className="w-full" disabled={loading || !name}>
        {loading ? 'Creating...' : 'Create Playlist'}
      </Button>
    </form>
  );
};

export default CreatePlaylistForm;