import { useEffect, useRef } from 'react';
import { musicApi } from '@api/music.api';
import { Track } from '@/types/models';
import {
  usePlayerProgress,
  useIsPlaying,
  useQueue,
  useCurrentSong,
} from './selectors/usePlayerSelectors';
import { usePlayerActions } from './actions/usePlayerActions';

export const useQueueManager = () => {
  const progress = usePlayerProgress();
  const isPlaying = useIsPlaying();
  const queue = useQueue();
  const currentSong = useCurrentSong();
  const { setQueue } = usePlayerActions();

  const isFetchingSimilarRef = useRef(false);
  const isPreparingNextRef = useRef(false);
  const preparedNextSongRef = useRef<Track | null>(null);

  const fillQueue = async () => {
    if (!currentSong?.id) return;
    try {
      const similarTracks = await musicApi.getSimilarTracks(currentSong.id);
      console.log('Similar tracks fetched:', similarTracks.length);
      setQueue(similarTracks);
    } catch (error) {
      console.error('Failed to fetch similar tracks:', error);
    } finally {
      isFetchingSimilarRef.current = false;
    }
  };

  useEffect(() => {
    if (
      isPlaying &&
      progress > 10 &&
      progress < 11 &&
      queue.length === 0 &&
      !isFetchingSimilarRef.current &&
      currentSong?.id
    ) {
      console.log('Progress at 10% - Fetching similar tracks...');
      isFetchingSimilarRef.current = true;

      fillQueue();
    }
  }, [progress, isPlaying, queue.length, currentSong?.id, setQueue]);

  useEffect(() => {
    const prepareNextSong = async () => {
      if (
        isPlaying &&
        progress > 60 &&
        progress < 61 &&
        !isPreparingNextRef.current &&
        queue.length > 0 &&
        currentSong?.id
      ) {
        isPreparingNextRef.current = true;

        try {
          const nextSong = queue[0];

          if (preparedNextSongRef.current?.title === nextSong.title) {
            console.log('️ Next song already prepared');
            isPreparingNextRef.current = false;
            return;
          }

          if (!nextSong.id) {
            console.log('️ Preparing next song from backend...');
            const preparedSong = await musicApi.prepareForPlaying({
              title: nextSong.title,
              artistName: nextSong.artistName,
              albumName: nextSong.albumName,
              albumCover: nextSong.albumCover,
              mbid: nextSong.mbid,
              duration: nextSong.duration,
              lastFMLink: nextSong.lastFMLink,
            });

            console.log('Next song prepared:', preparedSong);

            setQueue([preparedSong, ...queue.slice(1)]);
            preparedNextSongRef.current = preparedSong;
          } else {
            console.log('Next song already has ID');
            preparedNextSongRef.current = nextSong;
          }
        } catch (error) {
          console.error('Failed to prepare next song:', error);
        } finally {
          isPreparingNextRef.current = false;
        }
      }
    };

    prepareNextSong();
  }, [progress, isPlaying, queue, currentSong?.id, setQueue]);

  return {
    fillQueue,
    preparedNextSong: preparedNextSongRef.current,
  };
};
