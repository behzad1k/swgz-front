import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useLibrarySongs, useLikedSongs } from '@hooks/selectors/useLibrarySelectors.ts';
import { useLibrary } from '@hooks/useLibrary.ts';
import { FC } from 'react';
import SongItem from './SongItem';
import { Track } from '@/types/models.ts';

interface SongListProps {
  songs: Track[];
  onPlay: (song: Track) => void;
  onMore?: (song: Track) => void;
  currentSongId?: string;
}

const SongList: FC<SongListProps> = ({ songs, onMore, onPlay, currentSongId }) => {
  const { toggleLikeSong, toggleLibrary } = useLibrary()
  const librarySongs = useLibrarySongs();
  const likedSongs = useLikedSongs();
  const { addToQueue } = usePlayerActions()
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No songs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 h-fit scrollable">
      {songs.map((song, index) => (
        <SongItem
          key={'song' + index}
          song={song}
          onPlay={onPlay}
          onLike={toggleLikeSong}
          onMore={onMore}
          onQueueNext={addToQueue}
          onToggleLibrary={toggleLibrary}
          isPlaying={song.id != undefined && song.id === currentSongId}
          isLiked={song.id != undefined && likedSongs.map(e => e.id).includes(song.id)}
          songInLibrary={song.id != undefined && librarySongs.map(e => e.songId).includes(song.id)}
        />
      ))}
    </div>
  );
};

export default SongList;