// hooks/useLibraryActions.ts
import { useLibraryContext } from '@/contexts/LibraryContext';
import { LibraryActionKeys } from '@store/slices/librarySlice';
import { MostListened, Playlist, SearchHistory, Track } from '@/types/models';
import { LibraryState } from '@/types/states';
import { useCallback } from 'react';

export const useLibraryActions = () => {
  const { dispatch } = useLibraryContext();

  const setLikedSongs = useCallback(
    (songs: Track[]) => {
      dispatch({ type: LibraryActionKeys.SET_LIKED_SONGS, payload: songs });
    },
    [dispatch]
  );

  const setPlaylists = useCallback(
    (playlists: Playlist[]) => {
      dispatch({ type: LibraryActionKeys.SET_PLAYLISTS, payload: playlists });
    },
    [dispatch]
  );

  const setRecentlyPlayed = useCallback(
    (songs: Track[]) => {
      dispatch({ type: LibraryActionKeys.SET_RECENTLY_PLAYED, payload: songs });
    },
    [dispatch]
  );

  const setMostListened = useCallback(
    (songs: MostListened[]) => {
      dispatch({ type: LibraryActionKeys.SET_MOST_LISTENED, payload: songs });
    },
    [dispatch]
  );

  const setLibrarySongs = useCallback(
    (songs: Track[]) => {
      dispatch({ type: LibraryActionKeys.SET_LIBRARY_SONGS, payload: songs });
    },
    [dispatch]
  );

  const setRecentSearches = useCallback(
    (searches: SearchHistory[]) => {
      dispatch({ type: LibraryActionKeys.SET_RECENT_SEARCHES, payload: searches });
    },
    [dispatch]
  );

  const setLibrary = useCallback(
    (library: LibraryState) => {
      dispatch({ type: LibraryActionKeys.SET_LIBRARY, payload: library });
    },
    [dispatch]
  );

  const addLikedSong = useCallback(
    (song: Track) => {
      dispatch({ type: LibraryActionKeys.ADD_LIKED_SONG, payload: song });
    },
    [dispatch]
  );

  const removeLikedSong = useCallback(
    (songId: string) => {
      dispatch({ type: LibraryActionKeys.REMOVE_LIKED_SONG, payload: songId });
    },
    [dispatch]
  );

  const addPlaylist = useCallback(
    (playlist: Playlist) => {
      dispatch({ type: LibraryActionKeys.ADD_PLAYLIST, payload: playlist });
    },
    [dispatch]
  );

  const removePlaylist = useCallback(
    (playlistId: string) => {
      dispatch({ type: LibraryActionKeys.REMOVE_PLAYLIST, payload: playlistId });
    },
    [dispatch]
  );

  const updatePlaylist = useCallback(
    (playlist: Playlist) => {
      dispatch({ type: LibraryActionKeys.UPDATE_PLAYLIST, payload: playlist });
    },
    [dispatch]
  );

  return {
    setLikedSongs,
    setPlaylists,
    setRecentlyPlayed,
    setMostListened,
    setLibrarySongs,
    setRecentSearches,
    setLibrary,
    addLikedSong,
    removeLikedSong,
    addPlaylist,
    removePlaylist,
    updatePlaylist,
  };
};