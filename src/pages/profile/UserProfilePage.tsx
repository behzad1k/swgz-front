import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/router/hooks';
import { X, UserPlus, UserMinus } from '@/assets/svg';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SongItem from '@/components/music/SongItem';
import { profileApi } from '@/api/profile.api';
import { socialApi } from '@/api/social.api';
import { UserProfile } from '@/types/models.ts';

const UserProfilePage: FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isStalkeding, setIsStalkeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked' | 'comments' | 'reposts'>(
    'playlists'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username]);

  const loadProfile = async (user: string) => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile(user);
      setProfile(data.profile);
      // TODO: Check if currently stalking this user
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStalkToggle = async () => {
    if (!profile) return;

    try {
      if (isStalkeding) {
        await socialApi.unstalk(profile.id);
        setIsStalkeding(false);
      } else {
        await socialApi.stalk(profile.id);
        setIsStalkeding(true);
      }
    } catch (error) {
      console.error('Error toggling stalk:', error);
    }
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
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-white text-xl">User not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const tabs: Array<'playlists' | 'liked' | 'comments' | 'reposts'> = [
    'playlists',
    'liked',
    'comments',
    'reposts',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 pb-32">
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors"
        >
          <img src={X} alt={getAltFromPath(X)} width={28} />
        </button>

        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img
              src={
                profile.avatarUrl ||
                'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'
              }
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                {profile.subscriptionPlan == 'maxx' && <Badge variant="warning">maxx</Badge>}
                <Button
                  size="sm"
                  variant={isStalkeding ? 'secondary' : 'primary'}
                  icon={
                    isStalkeding ? (
                      <img src={UserMinus} alt={getAltFromPath(UserMinus)} width={16} />
                    ) : (
                      <img src={UserPlus} alt={getAltFromPath(UserPlus)} width={16} />
                    )
                  }
                  onClick={handleStalkToggle}
                >
                  {isStalkeding ? 'Unstalk' : 'Stalk'}
                </Button>
              </div>
              <p className="text-gray-300 mb-4">{profile.bio || 'No bio'}</p>
              <div className="flex gap-6 text-sm flex-wrap">
                <button className="hover:text-purple-400 transition-colors">
                  <span className="text-white font-semibold">{profile.stalkingsCount || 0}</span>
                  <span className="text-gray-400 ml-1">Stalking</span>
                </button>
                <button className="hover:text-purple-400 transition-colors">
                  <span className="text-white font-semibold">{profile.stalkersCount || 0}</span>
                  <span className="text-gray-400 ml-1">Stalkers</span>
                </button>
                <div>
                  <span className="text-white font-semibold">{profile.swgzScore || 0}</span>
                  <span className="text-gray-400 ml-1">swgz Score</span>
                </div>
              </div>
            </div>
          </div>

          {profile.songOfTheDay && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm text-gray-400 mb-2">Song of the Day</h3>
              <SongItem actions={[]} song={profile.songOfTheDay} onPlay={() => {}} />
            </div>
          )}
        </div>

        {!profile.isPrivate && (
          <>
            <div className="flex gap-2 border-b border-white/10 overflow-x-auto mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 capitalize whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="text-center py-12 text-gray-400">
              <p>Content for {activeTab} will be displayed here</p>
            </div>
          </>
        )}

        {profile.isPrivate && (
          <div className="text-center py-12 text-gray-400">
            <p>This account is private</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
