// store/slices/librarySlice.ts
import { MostListened, Playlist, SearchHistory, Track } from '@/types/models.ts';
import { LibraryState } from '@/types/states.ts';

export const initialLibraryState: LibraryState = {
  likedSongs: [],
  playlists: [],
  recentlyPlayed: [],
  mostListened: [],
  librarySongs: [],
  recentSearches: [],
};

export enum LibraryActionKeys {
  SET_LIKED_SONGS = 'SET_LIKED_SONGS',
  SET_PLAYLISTS = 'SET_PLAYLISTS',
  SET_RECENTLY_PLAYED = 'SET_RECENTLY_PLAYED',
  SET_MOST_LISTENED = 'SET_MOST_LISTENED',
  SET_LIBRARY_SONGS = 'SET_LIBRARY_SONGS',
  SET_RECENT_SEARCHES = 'SET_RECENT_SEARCHES',
  SET_LIBRARY = 'SET_LIBRARY',
  ADD_LIKED_SONG = 'ADD_LIKED_SONG',
  REMOVE_LIKED_SONG = 'REMOVE_LIKED_SONG',
  ADD_PLAYLIST = 'ADD_PLAYLIST',
  REMOVE_PLAYLIST = 'REMOVE_PLAYLIST',
  UPDATE_PLAYLIST = 'UPDATE_PLAYLIST',
}

export type LibraryAction =
  | { type: LibraryActionKeys.SET_LIKED_SONGS; payload: Track[] }
  | { type: LibraryActionKeys.SET_PLAYLISTS; payload: Playlist[] }
  | { type: LibraryActionKeys.SET_RECENTLY_PLAYED; payload: Track[] }
  | { type: LibraryActionKeys.SET_MOST_LISTENED; payload: MostListened[] }
  | { type: LibraryActionKeys.SET_LIBRARY_SONGS; payload: Track[] }
  | { type: LibraryActionKeys.SET_RECENT_SEARCHES; payload: SearchHistory[] }
  | { type: LibraryActionKeys.SET_LIBRARY; payload: LibraryState }
  | { type: LibraryActionKeys.ADD_LIKED_SONG; payload: Track }
  | { type: LibraryActionKeys.REMOVE_LIKED_SONG; payload: string }
  | { type: LibraryActionKeys.ADD_PLAYLIST; payload: Playlist }
  | { type: LibraryActionKeys.REMOVE_PLAYLIST; payload: string }
  | { type: LibraryActionKeys.UPDATE_PLAYLIST; payload: Playlist };

export const libraryReducer = (
  state: LibraryState,
  action: LibraryAction
): LibraryState => {
  switch (action.type) {
    case LibraryActionKeys.SET_LIKED_SONGS:
      return { ...state, likedSongs: action.payload };
    case LibraryActionKeys.SET_PLAYLISTS:
      return { ...state, playlists: action.payload };
    case LibraryActionKeys.SET_RECENTLY_PLAYED:
      return { ...state, recentlyPlayed: action.payload };
    case LibraryActionKeys.SET_MOST_LISTENED:
      return { ...state, mostListened: action.payload };
    case LibraryActionKeys.SET_LIBRARY_SONGS:
      return { ...state, librarySongs: action.payload };
    case LibraryActionKeys.SET_RECENT_SEARCHES:
      return { ...state, recentSearches: action.payload };
    case LibraryActionKeys.SET_LIBRARY:
      return action.payload;
    case LibraryActionKeys.ADD_LIKED_SONG:
      return { ...state, likedSongs: [...state.likedSongs, action.payload] };
    case LibraryActionKeys.REMOVE_LIKED_SONG:
      return {
        ...state,
        likedSongs: state.likedSongs.filter((song) => song.id !== action.payload),
      };
    case LibraryActionKeys.ADD_PLAYLIST:
      return { ...state, playlists: [...state.playlists, action.payload] };
    case LibraryActionKeys.REMOVE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.filter((playlist) => playlist.id !== action.payload),
      };
    case LibraryActionKeys.UPDATE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.payload.id ? action.payload : playlist
        ),
      };
    default:
      return state;
  }
};