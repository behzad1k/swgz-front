import { PlaylistDefault } from '@/types/models.ts';
import {
  useLikedSongs,
  useMostListened,
  useRecentlyPlayed,
} from '@hooks/selectors/useLibrarySelectors.ts';
import { DEFAULT_PLAYLIST } from '@utils/defaults.ts';
import { useEffect, useState } from 'react';

export const usePlaylistData = (slug: string) => {
  const [playlist, setPlaylist] = useState<PlaylistDefault>(DEFAULT_PLAYLIST);
  const mostPlayed = useMostListened();
  const recentlyPlayed = useRecentlyPlayed();
  const likedSongs = useLikedSongs();

  useEffect(() => {
    switch (slug) {
      case 'most-listened':
        setPlaylist({
          ...DEFAULT_PLAYLIST,
          description: 'Your Most Played Songs',
          isPublic: false,
          title: 'Most Played',
          songs: mostPlayed.map((e) => e.song),
        });
        break;
      case 'recently-played':
        setPlaylist({
          ...DEFAULT_PLAYLIST,
          description: 'Your Recently Played Songs',
          isPublic: false,
          title: 'Recently Played',
          songs: recentlyPlayed.map((e) => e.song),
        });
        break;
      case 'liked-songs':
        setPlaylist({
          ...DEFAULT_PLAYLIST,
          description: 'Your Liked Songs',
          isPublic: false,
          title: 'Liked Songs',
          songs: likedSongs.map((e) => e.song),
        });
        break;
    }
  }, [slug, mostPlayed, recentlyPlayed, likedSongs]);

  return playlist;
};
