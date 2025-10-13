import { useState } from 'react';
import { playlistApi } from '@/api/playlist.api';
import { Playlist } from '@/types/models.ts';

export const usePlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const data = await playlistApi.getUserPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (name: string, description?: string) => {
    try {
      const newPlaylist = await playlistApi.createPlaylist({ name, description });
      setPlaylists([...playlists, newPlaylist]);
      return newPlaylist;
    } catch (error) {
      throw error;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      await playlistApi.deletePlaylist(id);
      setPlaylists(playlists.filter((p) => p.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return { playlists, loading, fetchPlaylists, createPlaylist, deletePlaylist };
};

export default usePlaylist;