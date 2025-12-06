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
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useLibrarySongs, useLikedSongs, useMostListened, useRecentlyPlayed } from '@hooks/selectors/useLibrarySelectors.ts';
import { Clock, Heart, LayoutGrid, List, Music, Plus, Search, TrendingUp } from '@/assets/svg';
import { useIsPlaying } from '@hooks/selectors/usePlayerSelectors.ts';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useEffect, useState } from 'react';

const LibraryPage: FC = () => {
  // hooks
  const likedSongs = useLikedSongs();
  const mostListened = useMostListened();
  const recentlyPlayed = useRecentlyPlayed();
  const librarySongs = useLibrarySongs();
  const isPlaying = useIsPlaying();
  const { play, setQueue } = usePlayerActions()
  //states
  const [songs, setSongs] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, _setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const navigate = useNavigate();

  const onPlay = (track: Track) => {
    setQueue(librarySongs.slice(0, 20).filter(e => e.song.id != track.id).map(e => e.song))
    play(track)
  };

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
      icon:  <img src={Music} alt={getAltFromPath(Music)} width={18}/>

    },
    {
      value: 'playlists',
      label: 'Playlists',
      icon: <img src={List} alt={getAltFromPath(List)} width={18}/>
    },
  ];

  const quickLinks = [
    {
      value: 'liked-songs',
      label: 'Liked Songs',
      icon: <img src={Heart} alt={getAltFromPath(Heart)} width={20}/>,
      count: likedSongs.length
    },
    {
      value: 'recently-played',
      label: 'Recently Played',
      icon: <img src={Clock} alt={getAltFromPath(Clock)} width={20}/>,
      count: recentlyPlayed.length
    },
    {
      value: 'most-listened',
      label: 'Most Listened',
      icon: <img src={TrendingUp} alt={getAltFromPath(TrendingUp)} width={20}/>,
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
    <div className={`flex flex-col h-screen p-6 space-y-6 max-w-6xl mx-auto${isPlaying ? ' pb-28' : ''}  overflow-y-auto space-y-2`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        {activeTab === 'playlists' && (
          <Button icon={<img src={Plus} alt={getAltFromPath(Plus)} width={18}/>} onClick={() => setShowCreatePlaylist(true)}>
            Create Playlist
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search in your library..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={<img src={Search} alt={getAltFromPath(Search)} width={18}/>}
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
                <img src={List} alt={getAltFromPath(List)} width={18}/>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'
                }`}
              >
                <img src={LayoutGrid} alt={getAltFromPath(LayoutGrid)} width={18}/>
              </button>
            </div>
          )}
        </div>
      </div>

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


      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {activeTab === 'songs' && (
            <div className="flex-1 ">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <img src={Heart} alt={getAltFromPath(Heart)} width={48}/>
                  <p>No songs in your library yet</p>
                </div>
              ) : (
                <SongList songs={filteredSongs} onPlay={onPlay}/>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPlaylists.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <img src={List} alt={getAltFromPath(List)} width={48}/>
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

                          songs {playlist.isPublic ? 'Public' : 'Private'}
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

      <Modal isOpen={showCreatePlaylist} onClose={() => setShowCreatePlaylist(false)} title="Create New Playlist">
        <CreatePlaylistForm onSubmit={handleCreatePlaylist}/>
      </Modal>
    </div>
  );
};

export default LibraryPage;