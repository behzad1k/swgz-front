import { playlistApi } from '@/api/playlist.api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import CreatePlaylistForm from '@/components/forms/CreatePlaylistForm';
import PlaylistCard from '@/components/music/PlaylistCard';
import SongList from '@/components/music/SongList';
import { buildPath, routes } from '@/config/routes.config.ts';
import { useNavigate } from '@/router';
import { Playlist, Track } from '@/types/models.ts';
import { useLibrarySongs, useLikedSongs, useMostListened, useRecentlyPlayed } from '@hooks/selectors/useLibrarySelectors.ts';
import { Clock, Grid as GridIcon, Heart, List, Music, Plus, Search, TrendingUp } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

const LibraryPage: FC = () => {
  // hooks
  const likedSongs = useLikedSongs();
  const mostListened = useMostListened();
  const recentlyPlayed = useRecentlyPlayed();
  const librarySongs = useLibrarySongs();
  //states
  const [songs, setSongs] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, _setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const navigate = useNavigate();

  const handleCreatePlaylist = async (name: string, description: string) => {
    try {
      await playlistApi.createPlaylist({
        name,
        description
      });
      setShowCreatePlaylist(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    {
      value: 'songs',
      label: 'Songs',
      icon: <Music size={18}/>
    },
    {
      value: 'playlists',
      label: 'Playlists',
      icon: <List size={18}/>
    },
  ];

  const quickLinks = [
    {
      value: 'liked-songs',
      label: 'Liked Songs',
      icon: <Heart size={20}/>,
      count: likedSongs.length
    },
    {
      value: 'recently-played',
      label: 'Recently Played',
      icon: <Clock size={20}/>,
      count: recentlyPlayed.length
    },
    {
      value: 'most-listened',
      label: 'Most Listened',
      icon: <TrendingUp size={20}/>,
      count: mostListened.length
    },
  ];

  useEffect(() => {
    if (librarySongs.length) {
      setSongs(librarySongs.map(e => e.song));
      setLoading(false)
    }
  }, [librarySongs]);
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        {activeTab === 'playlists' && (
          <Button icon={<Plus size={20}/>} onClick={() => setShowCreatePlaylist(true)}>
            Create Playlist
          </Button>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, idx) => (
          <div
            key={idx}
            className="bg-white/5 hover:bg-white/10 rounded-xl p-6 cursor-pointer transition-all duration-200 group"
            onClick={() => navigate(buildPath(routes.defaultPlaylist, { slug: link.value }))}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                {link.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                  {link.label}
                </h3>
                <p className="text-gray-400 text-sm">{link.count} items</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search in your library..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={<Search size={20}/>}
          />
        </div>
        <div className="flex gap-2">
          {activeTab === 'playlists' && (
            <div className="flex bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'
                }`}
              >
                <List size={20}/>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'
                }`}
              >
                <GridIcon size={20}/>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as any)}
            className={`flex items-center gap-2 px-4 py-3 transition-all ${
              activeTab === tab.value
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {activeTab === 'songs' && (
            <div className="space-y-2">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Heart size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>No songs in your library yet</p>
                </div>
              ) : (
                <SongList songs={filteredSongs}/>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPlaylists.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <List size={48} className="mx-auto mb-4 opacity-50"/>
                      <p>No playlists yet</p>
                    </div>
                  ) : (
                    filteredPlaylists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} onClick={() => {
                      }}/>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <img
                        src={playlist.coverUrl || 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'}
                        alt={playlist.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{playlist.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {/* {playlist.songCount || 0}  */}
                          songs • {playlist.isPublic ? 'Public' : 'Private'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Create Playlist Modal */}
      <Modal isOpen={showCreatePlaylist} onClose={() => setShowCreatePlaylist(false)} title="Create New Playlist">
        <CreatePlaylistForm onSubmit={handleCreatePlaylist}/>
      </Modal>
    </div>
  );
};

export default LibraryPage;