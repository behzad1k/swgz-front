import { TrackAction } from '@/types/global.ts';
import { Track } from '@/types/models.ts';
import { Heart, HeartFilled, ListEnd, ListMinus, ListPlus } from '@assets/svg';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useLibrarySongs, useLikedSongs } from '@hooks/selectors/useLibrarySelectors.ts';
import { useLibrary } from '@hooks/useLibrary.ts';
import { getAltFromPath } from '@utils/helpers.ts';
import React, { useCallback } from 'react';

export const useTrackActions = () => {

  const { toggleLikeSong, toggleLibrary } = useLibrary()
  const { addToQueue, removeFromQueue } = usePlayerActions()
  const likedSongs = useLikedSongs();
  const librarySongs = useLibrarySongs();

  const addToFavorites: TrackAction = {
    alt: getAltFromPath(Heart) || '',
    icon: Heart,
    onClick(song: Track, _e: React.MouseEvent): any {
      toggleLikeSong(song)
    },
    tooltip: 'Add To Liked Songs'
  }

  const removeFromFavorites: TrackAction = {
    alt: getAltFromPath(HeartFilled) || '',
    className: 'filter-svg-red',
    icon: HeartFilled,
    onClick(song: Track, _e: React.MouseEvent): any {
      toggleLikeSong(song)
    },
    tooltip: 'Remove Liked Songs'
  }

  const addtoLibrary: TrackAction = {
    alt: getAltFromPath(ListPlus) || '',
    icon: ListPlus,
    onClick(song: Track, _e: React.MouseEvent): any {
      toggleLibrary(song)
    },
    tooltip: 'Add to Library'
  }

  const removeFromLibrary: TrackAction = {
    alt: getAltFromPath(ListMinus) || '',
    className: 'filter-svg-red',
    icon: ListMinus,
    onClick(song: Track, _e: React.MouseEvent): void {
      toggleLibrary(song)
    },
    tooltip: 'Remove From Library'
  }

  const addToQueueButton = (song: Track): TrackAction => ({
    alt: getAltFromPath(ListEnd) || '',
    icon: ListEnd,
    onClick(_track: Track, _e: React.MouseEvent): void {
      addToQueue(song)
    },
    tooltip: 'Add To Queue'
  })

  const deleteFromQueueButton = (songIndex: number): TrackAction => ({
    alt: getAltFromPath(ListMinus) || '',
    icon: ListMinus,
    onClick(_track: number, _e: React.MouseEvent): void {
      removeFromQueue(songIndex)
    },
    tooltip: 'Delete From Queue'
  })


  const likeSong = useCallback((song: Track): TrackAction => {
    const isLiked = song.id != undefined && likedSongs.map(e => e.songId).includes(song.id)
    return isLiked ? removeFromFavorites : addToFavorites
  }, [likedSongs.length])

  const librarySong = useCallback((song: Track): TrackAction => {
    const isInLibrary = song.id != undefined && librarySongs.map(e => e.songId).includes(song.id)
    return isInLibrary ? removeFromLibrary : addtoLibrary
  }, [librarySongs.length])

  return {
    librarySong,
    likeSong,
    addToQueueButton,
    deleteFromQueueButton
  }
}