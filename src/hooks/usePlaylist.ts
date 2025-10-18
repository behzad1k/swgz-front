import { useCallback, useState } from 'react';
import { playlistApi } from '@/api/playlist.api';
import { Playlist } from '@/types/models';
import { useLibraryActions } from './actions/useLibraryActions';
import { usePlaylists } from './selectors/useLibrarySelectors';

export const usePlaylist = () => {
  const playlists = usePlaylists();
  const { setPlaylists, addPlaylist, removePlaylist, updatePlaylist } = useLibraryActions();
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await playlistApi.getUserPlaylists();
      setPlaylists(data);
      return data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPlaylists]);

  const createPlaylist = useCallback(
    async (name: string, description?: string) => {
      try {
        const newPlaylist = await playlistApi.createPlaylist({ name, description });
        addPlaylist(newPlaylist);
        return newPlaylist;
      } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
      }
    },
    [addPlaylist]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      try {
        await playlistApi.deletePlaylist(id);
        removePlaylist(id);
      } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
      }
    },
    [removePlaylist]
  );

  const editPlaylist = useCallback(
    async (id: string, updates: Partial<Playlist>) => {
      try {
        const updatedPlaylist = await playlistApi.updatePlaylist(id, updates);
        updatePlaylist(updatedPlaylist);
        return updatedPlaylist;
      } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
      }
    },
    [updatePlaylist]
  );

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      try {
        const updatedPlaylist = await playlistApi.addSong(playlistId, trackId);
        updatePlaylist(updatedPlaylist);
        return updatedPlaylist;
      } catch (error) {
        console.error('Error adding track to playlist:', error);
        throw error;
      }
    },
    [updatePlaylist]
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      try {
        const updatedPlaylist = await playlistApi.removeSong(playlistId, trackId);
        updatePlaylist(updatedPlaylist);
        return updatedPlaylist;
      } catch (error) {
        console.error('Error removing track from playlist:', error);
        throw error;
      }
    },
    [updatePlaylist]
  );

  return {
    playlists,
    loading,
    fetchPlaylists,
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  };
};

export default usePlaylist;