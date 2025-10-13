import { musicApi } from '@/api/music.api';
import { profileApi } from '@/api/profile.api';
import SearchBar from '@/components/forms/SearchBar';
import AlbumCard from '@/components/music/AlbumCard';
import ArtistCard from '@/components/music/ArtistCard';
import SongList from '@/components/music/SongList';
import UserCard from '@/components/social/UserCard';
import { buildPath, routes } from '@/config/routes.config.ts';
import { useApp } from '@/contexts/AppContext.tsx';
import { SearchFilters } from '@/enums/global.ts';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from '@/router';
import { Album, Artist, SearchHistory, Track, UserProfile } from '@/types/models.ts';
import { ArchiveRestoreIcon, Disc, Music, Search, User, Users } from 'lucide-react';
import { FC, ReactElement, useState } from 'react';

interface SearchResult {
  all: any[];
  track: Track[];
  stalker: UserProfile[];
  artist: Artist[];
  album: Album[];
}

const SearchPage: FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilters>(SearchFilters.track);
  const [results, setResults] = useState<SearchResult>({
    all: [],
    track: [],
    stalker: [],
    artist: [],
    album: [],
  });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate()
  // @ts-ignore
  const { state } = useApp();

  // useEffect(() => {
  //   if (debouncedQuery.trim()) {
  //     if (debouncedQuery.trim().length > 10) {
  //       handleSearch()
  //     }
  //   } else {
  //     setResults({ track: [], stalker: [], artist: [], album: [] });
  //   }
  // }, [debouncedQuery]);

  const handleSearch = async (query: string = debouncedQuery, customFitler = filter) => {
    setLoading(true);
    try {
      let promises: Promise<UserProfile[] | Track[] | Artist[] | Album[]>[] = [profileApi.searchStalkers(query.replaceAll(' ', '%20'))];
      if (filter != SearchFilters.stalker) promises.push(musicApi.search(query, customFitler));

      const [stalkersData, searchData] = await Promise.all(promises);

      const newResult: any = {
        all: [],
        stalker: (stalkersData as UserProfile[]),
        artist: [],
        album: [],
        track: []
      };

      if (filter != SearchFilters.stalker) newResult[customFitler] = searchData;

      setResults(newResult);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters: {
    value: SearchFilters,
    label: string,
    icon: ReactElement
  }[] = [
    {
      value: SearchFilters.all,
      label: 'All',
      icon: <Search size={16}/>
    },
    {
      value: SearchFilters.track,
      label: 'Songs',
      icon: <Music size={16}/>
    },
    {
      value: SearchFilters.artist,
      label: 'Artists',
      icon: <User size={16}/>
    },
    {
      value: SearchFilters.album,
      label: 'Albums',
      icon: <Disc size={16}/>
    },
    {
      value: SearchFilters.stalker,
      label: 'Stalkers',
      icon: <Users size={16}/>
    },
  ] as const;

  const selectSearchHistory = async (searchHistory: SearchHistory) => {
    setQuery(searchHistory.query)
    setFilter(searchHistory.filter || SearchFilters.track)
    await handleSearch(searchHistory.query, searchHistory.filter)
  };

  const shouldShowSection = (section: SearchFilters) => {
    return filter == section;
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Search</h1>

        <SearchBar placeholder="Search for track, artist, album, or stalker..." value={query} onChange={setQuery} onSearch={handleSearch}/>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 row-reverse">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                filter === f.value ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="mt-4">Searching...</p>
        </div>
      ) : !query ? (
        <div className="text-center py-12 text-gray-400">
          {state.library.recentSearches.length ? (
            <div className="flex flex-col gap-4 ">
              {state.library.recentSearches.map(e =>
                <div className="flex justify-between" key={e.id}>
                  <div className="flex flex-col gap-1 " onClick={async () => await selectSearchHistory(e)}>
                    <span className="text-m">{e.query}</span>
                    <span className="text-sm">{e.filter}</span>
                  </div>
                  <ArchiveRestoreIcon size={12}/>
                </div>
              )}
            </div>
          ) :
          <>
            <Search size={48} className="mx-auto mb-4 opacity-50"/>
            <p>Start typing to search for music and stalker</p>
          </>}

        </div>
      ) : (
        <div className="space-y-8">
          {/* Songs */}
          {shouldShowSection(SearchFilters.track) && results.track.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
              <SongList songs={results.track}/>
            </div>
          )}

          {/* Users */}
          {shouldShowSection(SearchFilters.stalker) && results.stalker.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Users</h2>
              <div className="space-y-2">
                {results.stalker.map((user) => (
                  <UserCard key={user.id} user={user} onStalk={() => {
                  }} onView={() => {
                  }}/>
                ))}
              </div>
            </div>
          )}

          {/* Artists */}
          {shouldShowSection(SearchFilters.artist) && results.artist.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.artist.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} onClick={() => navigate(buildPath(routes.artist, { id: artist.id }))}/>
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {shouldShowSection(SearchFilters.album) && results.album.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.album.map((album) => (
                  <AlbumCard key={album.id} album={album} onClick={() => {
                  }}/>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query &&
            !loading &&
            results.track.length === 0 &&
            results.stalker.length === 0 &&
            results.artist.length === 0 &&
            results.album.length === 0 &&
            (
              <div className="text-center py-12 text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-50"/>
                <p className="text-lg mb-2">No results found for "{query}"</p>
                <p className="text-sm">Try different keywords or check your spelling</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;