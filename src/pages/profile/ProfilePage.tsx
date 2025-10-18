import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useEffect } from 'react';
import { useNavigate } from '@/router/hooks';
import { Edit2, Settings, LogOut } from '@/assets/svg';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SongItem from '@/components/music/SongItem';
import { profileApi } from '@/api/profile.api';
import { UserProfile } from '@/types/models.ts';

const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked' | 'comments' | 'reposts'>('playlists');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // TODO: Replace with actual current user endpoint
      const data = await profileApi.getProfile('me');
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Profile not found</p>
      </div>
    );
  }

  const tabs: Array<'playlists' | 'liked' | 'comments' | 'reposts'> = ['playlists', 'liked', 'comments', 'reposts'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 pb-32">
      <div className="max-w-6xl mx-auto p-6">

        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img
              src={profile.avatarUrl || 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'}
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                {profile.subscriptionPlan == 'premium' && <Badge variant="warning">Premium</Badge>}
                <Button size="sm" icon={<img src={Edit2} alt={getAltFromPath(Edit2)} width={16} />} onClick={() => navigate('/profile/edit')}>
                  Edit
                </Button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <img src={Settings} alt={getAltFromPath(Settings)} width={20} className="text-gray-400" />
                </button>
                <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <img src={LogOut} alt={getAltFromPath(LogOut)} width={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-300 mb-4">{profile.bio || 'No bio yet'}</p>
              <div className="flex gap-6 text-sm flex-wrap">
                <div>
                  <span className="text-white font-semibold">{profile.stalkingsCount || 0}</span>
                  <span className="text-gray-400 ml-1">Stalking</span>
                </div>
                <div>
                  <span className="text-white font-semibold">{profile.stalkersCount || 0}</span>
                  <span className="text-gray-400 ml-1">Stalkers</span>
                </div>
                <div>
                  <span className="text-white font-semibold">{profile.swgzScore || 0}</span>
                  <span className="text-gray-400 ml-1">swgz  Score</span>
                </div>
              </div>
            </div>
          </div>

          {profile.songOfTheDay && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm text-gray-400 mb-2">Song of the Day</h3>
              <SongItem song={profile.songOfTheDay} onPlay={() => {}} />
            </div>
          )}
        </div>


        <div className="flex gap-2 border-b border-white/10 overflow-x-auto mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>


        <div className="text-center py-12 text-gray-400">
          <p>Content for {activeTab} will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;