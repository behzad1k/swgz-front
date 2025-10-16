// hooks/useLibrarySelectors.ts
import { useLibraryContext } from '@/contexts/LibraryContext.tsx';
import { useMemo } from 'react';

export const useLibraryState = () => {
  const { state } = useLibraryContext();
  return state;
};

export const useLikedSongs = () => {
  const { state } = useLibraryContext();
  return state.likedSongs;
};

export const usePlaylists = () => {
  const { state } = useLibraryContext();
  return state.playlists;
};

export const useRecentlyPlayed = () => {
  const { state } = useLibraryContext();
  return state.recentlyPlayed;
};

export const useMostListened = () => {
  const { state } = useLibraryContext();
  return state.mostListened;
};

export const useLibrarySongs = () => {
  const { state } = useLibraryContext();
  return state.librarySongs;
};

export const useRecentSearches = () => {
  const { state } = useLibraryContext();
  return state.recentSearches;
};

// Computed selectors
export const useIsLiked = (songId: string) => {
  const { state } = useLibraryContext();
  return useMemo(
    () => state.likedSongs.some((song) => song.id === songId),
    [state.likedSongs, songId]
  );
};

export const usePlaylistById = (playlistId: string) => {
  const { state } = useLibraryContext();
  return useMemo(
    () => state.playlists.find((playlist) => playlist.id === playlistId),
    [state.playlists, playlistId]
  );
};

export const useLikedSongsCount = () => {
  const { state } = useLibraryContext();
  return useMemo(() => state.likedSongs.length, [state.likedSongs.length]);
};

export const usePlaylistsCount = () => {
  const { state } = useLibraryContext();
  return useMemo(() => state.playlists.length, [state.playlists.length]);
};