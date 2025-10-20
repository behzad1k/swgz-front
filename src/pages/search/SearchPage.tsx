import { musicApi } from '@/api/music.api';
import { profileApi } from '@/api/profile.api';
import { Disc3, Music, RefreshCcw, Search, User, Users } from '@/assets/svg';
import SearchBar from '@/components/forms/SearchBar';
import AlbumCard from '@/components/music/AlbumCard';
import ArtistCard from '@/components/music/ArtistCard';
import SongList from '@/components/music/SongList';
import UserCard from '@/components/social/UserCard';
import { buildPath, routes } from '@/config/routes.config.ts';
import { SearchFilters } from '@/enums/global.ts';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from '@/router';
import { SearchResult } from '@/types/global.ts';
import { SearchHistory, UserProfile } from '@/types/models.ts';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useRecentSearches } from '@hooks/selectors/useLibrarySelectors.ts';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, ReactElement, useState } from 'react';

const DEFAULT_SEARCH_RESULT = {
  track: [],
  stalker: [],
  artist: [],
  album: [],
};

const SearchPage: FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilters>(SearchFilters.all);
  const [results, setResults] = useState<SearchResult>(DEFAULT_SEARCH_RESULT);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const recentSearches = useRecentSearches();
  const { play } = usePlayerActions();

  const handleSearch = async (query: string = debouncedQuery, customFilter = filter) => {
    setLoading(true);
    try {
      let promises: Promise<UserProfile[] | SearchResult>[] = [profileApi.searchStalkers(query.replaceAll(' ', '%20'))];
      if (filter != SearchFilters.stalker) promises.push(musicApi.search(query, customFilter));

      const [stalkersData, searchData] = await Promise.all(promises);

      let newResult: SearchResult = DEFAULT_SEARCH_RESULT;

      if (searchData) {
        newResult = searchData as SearchResult;
      }

      newResult.stalker = stalkersData as UserProfile[];

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
      icon: <img src={Search} alt={getAltFromPath(Search)} width={16}/>
    },
    {
      value: SearchFilters.track,
      label: 'Songs',
      icon: <img src={Music} alt={getAltFromPath(Music)} width={16}/>
    },
    {
      value: SearchFilters.artist,
      label: 'Artists',
      icon: <img src={User} alt={getAltFromPath(User)} width={16}/>
    },
    {
      value: SearchFilters.album,
      label: 'Albums',
      icon: <img src={Disc3} alt={getAltFromPath(Disc3)} width={16}/>
    },
    {
      value: SearchFilters.stalker,
      label: 'Stalkers',
      icon: <img src={Users} alt={getAltFromPath(Users)} width={16}/>
    },
  ] as const;

  const selectSearchHistory = async (searchHistory: SearchHistory) => {
    setQuery(searchHistory.query);
    setFilter(searchHistory.filter || SearchFilters.track);
    await handleSearch(searchHistory.query, searchHistory.filter);
  };

  return (
    <div className="h-screen flex flex-col p-6 max-w-6xl mx-auto">

      <div className="flex-shrink-0 space-y-6 mb-6">
        <h1 className="text-3xl font-bold text-white">Search</h1>

        <SearchBar placeholder="Search for track, artist, album, or stalker..." value={query} onChange={setQuery} onSearch={handleSearch}/>


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


      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"/>
            <p className="mt-4">Searching...</p>
          </div>
        ) : !query ? (
          <div className="text-center py-12 text-gray-400">
            {recentSearches.length ? (
                <div className="flex flex-col gap-4 ">
                  {recentSearches.filter(e => filter != SearchFilters.all ? e.filter == filter : true).map(e =>
                    <div className="flex justify-between" key={e.id}>
                      <div className="flex flex-col gap-1 " onClick={async () => await selectSearchHistory(e)}>
                        <span className="text-m">{e.query}</span>
                        <span className="text-sm">{e.filter}</span>
                      </div>
                      <img src={RefreshCcw} alt={getAltFromPath(RefreshCcw)} width={18} className="mx-auto mb-4 opacity-50"/>
                    </div>
                  )}
                </div>
              ) :
              <>
                <img src={Search} alt={getAltFromPath(Search)} width={48} className="mx-auto mb-4 opacity-50"/>
                <p>Start typing to search for music and stalker</p>
              </>}
          </div>
        ) : (
          <div className="space-y-8 pb-6">

            {[SearchFilters.all, SearchFilters.artist].includes(filter) && results?.artist?.length > 0 && (
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
                <div className={`${filter == SearchFilters.all ? 'flex flex-1 overflow-x-auto gap-4' : 'flex flex-wrap justify-evenly'}`}>
                  {results.artist.map((artist) => (
                    <div className='min-w-36 max-w-36'>
                      <ArtistCard key={artist.id} artist={artist} onClick={() => navigate(buildPath(routes.artist, { id: artist.id }))}/>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {[SearchFilters.all, SearchFilters.stalker].includes(filter) && results?.stalker?.length > 0 && (
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


            {[SearchFilters.all, SearchFilters.album].includes(filter) && results?.album?.length > 0 && (
              <div className='flex flex-col'>
                <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
                <div className={`${filter == SearchFilters.all ? 'flex flex-1 overflow-x-auto gap-4' : 'flex flex-wrap justify-evenly'}`}>
                  {results.album.map((album) => (
                    <div className='min-w-36 max-w-36'>
                    <AlbumCard key={album.id} album={album} onClick={() => {
                    }}/>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {[SearchFilters.all, SearchFilters.track].includes(filter) && results?.track?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
                <SongList onPlay={play} songs={results.track}/>
              </div>
            )}

            {query &&
              !loading &&
              results.track.length === 0 &&
              results.stalker.length === 0 &&
              results.artist.length === 0 &&
              results.album.length === 0 &&
              (
                <div className="text-center py-12 text-gray-400">
                  <img src={Search} alt={getAltFromPath(Search)} width={48} className="mx-auto mb-4"/>
                  <p className="text-lg mb-2">No results found for "{query}"</p>
                  <p className="text-sm">Try different keywords or check your spelling</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;