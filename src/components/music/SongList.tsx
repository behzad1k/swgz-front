import { useTrackActions } from '@hooks/useTrackActions.ts';
import { FC } from 'react';
import SongItem from './SongItem';
import { Track } from '@/types/models.ts';

interface SongListProps {
  songs: Track[];
  onPlay: (song: Track) => void;
  currentSongId?: string;
  showAddToPlaylist?: boolean;
}

const SongList: FC<SongListProps> = ({
  songs,
  onPlay,
  currentSongId,
  showAddToPlaylist = true,
}) => {
  const { likeSong, librarySong, addToQueueButton, addToPlaylistButton } = useTrackActions();

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No songs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 h-fit scrollable">
      {songs.map((song, index) => {
        const actions = [librarySong(song), likeSong(song), addToQueueButton(song)];

        if (showAddToPlaylist) {
          actions.push(addToPlaylistButton(song));
        }

        return (
          <SongItem
            key={'song' + index}
            song={song}
            onPlay={onPlay}
            actions={actions}
            isPlaying={song.id != undefined && song.id === currentSongId}
          />
        );
      })}
    </div>
  );
};

export default SongList;
