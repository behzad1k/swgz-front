import { TrackAction } from '@/types/global.ts';
import { Track } from '@/types/models.ts';
import { Heart, HeartFilled, ListEnd, ListMinus, ListPlus, Plus } from '@assets/svg';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import {
  useLibrarySongs,
  useLikedSongs,
  usePlaylists,
} from '@/hooks/selectors/useLibrarySelectors.ts';
import { useLibrary } from '@/hooks/useLibrary.ts';
import { useModal } from '@/hooks/useModal.ts';
import { getAltFromPath } from '@/utils/helpers.ts';
import React, { useCallback } from 'react';
import AddToPlaylistModal from '@/pages/playlist/components/AddToPlaylistModal';
import usePlaylist from './usePlaylist';

export const useTrackActions = () => {
  const { toggleLikeSong, toggleLibrary } = useLibrary();
  const { addToQueue, removeFromQueue } = usePlayerActions();
  const { openModal, closeModal } = useModal();
  const likedSongs = useLikedSongs();
  const librarySongs = useLibrarySongs();
  const playlists = usePlaylists();
  const { fetchPlaylists } = usePlaylist();

  const addToFavorites: TrackAction = {
    alt: getAltFromPath(Heart) || '',
    icon: Heart,
    onClick(song: Track, _e: React.MouseEvent): any {
      toggleLikeSong(song);
    },
    tooltip: 'Add To Liked Songs',
  };

  const removeFromFavorites: TrackAction = {
    alt: getAltFromPath(HeartFilled) || '',
    className: 'filter-svg-red',
    icon: HeartFilled,
    onClick(song: Track, _e: React.MouseEvent): any {
      toggleLikeSong(song);
    },
    tooltip: 'Remove Liked Songs',
  };

  const addtoLibrary: TrackAction = {
    alt: getAltFromPath(ListPlus) || '',
    icon: ListPlus,
    onClick(song: Track, _e: React.MouseEvent): any {
      toggleLibrary(song);
    },
    tooltip: 'Add to Library',
  };

  const removeFromLibrary: TrackAction = {
    alt: getAltFromPath(ListMinus) || '',
    className: 'filter-svg-red',
    icon: ListMinus,
    onClick(song: Track, _e: React.MouseEvent): void {
      toggleLibrary(song);
    },
    tooltip: 'Remove From Library',
  };

  const addToQueueButton = (song: Track): TrackAction => ({
    alt: getAltFromPath(ListEnd) || '',
    icon: ListEnd,
    onClick(_track: Track, _e: React.MouseEvent): void {
      addToQueue(song);
    },
    tooltip: 'Add To Queue',
  });

  const deleteFromQueueButton = (songIndex: number): TrackAction => ({
    alt: getAltFromPath(ListMinus) || '',
    icon: ListMinus,
    onClick(_track: number, _e: React.MouseEvent): void {
      removeFromQueue(songIndex);
    },
    tooltip: 'Delete From Queue',
  });

  const addToPlaylistButton = (song: Track): TrackAction => ({
    alt: getAltFromPath(Plus) || '',
    icon: Plus,
    onClick(_track: Track, _e: React.MouseEvent): void {
      const modalId = 'add-to-playlist-' + song.id;
      openModal({
        id: modalId,
        component: AddToPlaylistModal,
        props: {
          playlists,
          songData: {
            id: song.id,
            title: song.title,
            artistName: song.artistName,
            albumName: song.albumName,
            albumCover: song.albumCover,
            duration: song.duration,
            mbid: song.mbid,
            lastFMLink: song.lastFMLink,
          },
          onSuccess: async () => {
            await fetchPlaylists();
            // Optionally refresh playlists or show success message
          },
        },
        size: 'md',
        animation: 'slideUp',
        onClose: () => closeModal(modalId),
      });
    },
    tooltip: 'Add to Playlist',
  });

  const removeFromPlaylistButton = (playlistId: string, songId: string): TrackAction => ({
    alt: getAltFromPath(Plus) || '',
    icon: ListMinus,
    onClick(_track: Track, _e: React.MouseEvent): void {},
    tooltip: 'Remove From Playlist',
  });

  const likeSong = useCallback(
    (song: Track): TrackAction => {
      const isLiked = song.id != undefined && likedSongs.map((e) => e.songId).includes(song.id);
      return isLiked ? removeFromFavorites : addToFavorites;
    },
    [likedSongs.length]
  );

  const librarySong = useCallback(
    (song: Track): TrackAction => {
      const isInLibrary =
        song.id != undefined && librarySongs.map((e) => e.songId).includes(song.id);
      return isInLibrary ? removeFromLibrary : addtoLibrary;
    },
    [librarySongs.length]
  );

  return {
    librarySong,
    likeSong,
    addToQueueButton,
    deleteFromQueueButton,
    addToPlaylistButton,
  };
};
