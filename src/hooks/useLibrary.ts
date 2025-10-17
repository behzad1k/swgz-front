import { Track } from '@/types/models.ts';
import { libraryApi } from '@api/library.api.ts';
import { useLibraryActions } from '@hooks/actions/useLibraryActions.ts';
import { useLibrarySongs } from '@hooks/selectors/useLibrarySelectors.ts';

export const useLibrary = () => {
  const { addLikedSong, removeLikedSong, addLibrarySong, removeLibrarySong } = useLibraryActions();
  const librarySongs = useLibrarySongs();

  const toggleLikeSong = async (song: Track) => {
    if (!song.id) return
    try {
      const res = await libraryApi.toggleLike(song.id);

      if (res.isLiked) addLikedSong(res.librarySong);
      else removeLikedSong(song.id)

    }catch (error) {
      console.log(error);
    }
  }

  const toggleLibrary = async (song: Track) => {
    if (!song.id) return
    try {
      if (librarySongs.find(e => e.songId === song.id)){
        await libraryApi.removeFromLibrary(song.id);
        removeLibrarySong(song.id)
      } else {
        const res = await libraryApi.addToLibrary({
          id: song.id,
          title: song.title,
          artistName: song.artistName,
        });
        addLibrarySong(res);
      }
    }catch (error) {
      console.log(error);
    }
  }

  return {
    toggleLikeSong,
    toggleLibrary,
  }
}