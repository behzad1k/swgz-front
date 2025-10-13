import { RootState } from '@/types/states.ts';

export const selectLibrary = (state: RootState) => state.library;
export const selectLikedSongs = (state: RootState) => state.library.likedSongs;
export const selectPlaylists = (state: RootState) => state.library.playlists;
export const selectRecentlyPlayed = (state: RootState) => state.library.recentlyPlayed;
export const selectMostListened = (state: RootState) => state.library.mostListened;