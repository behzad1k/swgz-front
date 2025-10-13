import { FC, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Upload } from 'lucide-react';
import { UserProfile } from '@/types/models.ts';

interface EditProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: Partial<UserProfile>, avatar?: File) => void;
  loading?: boolean;
}

const EditProfileForm: FC<EditProfileFormProps> = ({ profile, onSubmit, loading = false }) => {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || '');
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate || false);
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, bio, isPrivate }, avatar || undefined);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center mb-4">
        <label className="cursor-pointer relative">
          <img
            src={avatar ? URL.createObjectURL(avatar) : profile.avatarUrl || 'https://via.placeholder.com/120'}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full">
            <Upload size={20} className="text-white" />
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>
      </div>

      <Input
        placeholder="Username"
        value={username}
        onChange={setUsername}
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
      />
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <span className="text-white">Private Account</span>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="w-5 h-5 rounded"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};

export default EditProfileForm;