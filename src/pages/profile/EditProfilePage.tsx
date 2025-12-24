import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useEffect } from 'react';
import { useNavigate } from '@/router/hooks';
import { X } from '@/assets/svg';
import EditProfileForm from '@/components/forms/EditProfileForm';
import { profileApi } from '@/api/profile.api';
import { UserProfile } from '@/types/models.ts';

const EditProfilePage: FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // TODO: Get current user's profile
      const data = await profileApi.getProfile('me');
      setProfile(data.profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (data: Partial<UserProfile>, avatar?: File) => {
    console.log(avatar);
    setLoading(true);
    try {
      await profileApi.updateMyProfile(data);
      // TODO: Upload avatar if provided
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
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
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <img src={X} alt={getAltFromPath(X)} width={28} />
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-8">
          <EditProfileForm profile={profile} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
