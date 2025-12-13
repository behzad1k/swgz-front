import { Playlist, PlaylistSong } from '@/types/models.ts';
import {
  useLikedSongs,
  useMostListened,
  useRecentlyPlayed,
  useLibrarySongs,
} from '@hooks/selectors/useLibrarySelectors.ts';
import { useEffect, useState } from 'react';

export const usePlaylistData = (slug: string) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const mostPlayed = useMostListened();
  const recentlyPlayed = useRecentlyPlayed();
  const likedSongs = useLikedSongs();
  const librarySongs = useLibrarySongs();

  useEffect(() => {
    switch (slug) {
      case 'most-listened':
        setPlaylist({
          id: 'most-listened',
          title: 'Most Played',
          description: 'Your Most Played Songs',
          isPublic: false,
          isEditable: false,
          source: 'default',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          songs: mostPlayed.map((e, index) => ({
            id: `ml-${e.song.id}-${index}`,
            songId: e.song.id || '',
            playlistId: 'most-listened',
            position: index,
            addedAt: new Date(),
            song: e.song,
          })) as PlaylistSong[],
        });
        break;
      case 'recently-played':
        setPlaylist({
          id: 'recently-played',
          title: 'Recently Played',
          description: 'Your Recently Played Songs',
          isPublic: false,
          isEditable: false,
          source: 'default',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          songs: recentlyPlayed.map((e, index) => ({
            id: `rp-${e.song.id}-${index}`,
            songId: e.song.id || '',
            playlistId: 'recently-played',
            position: index,
            addedAt: e.playedAt,
            song: e.song,
          })) as PlaylistSong[],
        });
        break;
      case 'liked-songs':
        setPlaylist({
          id: 'liked-songs',
          title: 'Liked Songs',
          description: 'Your Liked Songs',
          isPublic: false,
          isEditable: false,
          source: 'default',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          songs: likedSongs.map((e, index) => ({
            id: `ls-${e.song.id}-${index}`,
            songId: e.song.id || '',
            playlistId: 'liked-songs',
            position: index,
            addedAt: e.addedAt,
            song: e.song,
          })) as PlaylistSong[],
        });
        break;
      case 'library-songs':
        setPlaylist({
          id: 'library-songs',
          title: 'Library',
          description: 'All Songs in Your Library',
          isPublic: false,
          isEditable: false,
          source: 'default',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          songs: librarySongs.map((e, index) => ({
            id: `lib-${e.song.id}-${index}`,
            songId: e.song.id || '',
            playlistId: 'library-songs',
            position: index,
            addedAt: e.addedAt,
            song: e.song,
          })) as PlaylistSong[],
        });
        break;
      default:
        setPlaylist(undefined);
    }
  }, [slug, mostPlayed, recentlyPlayed, likedSongs, librarySongs]);

  return playlist;
};
