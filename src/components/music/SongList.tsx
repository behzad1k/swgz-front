import { useApp } from '@/contexts/AppContext.tsx';
import { FC } from 'react';
import SongItem from './SongItem';
import { Track } from '@/types/models.ts';

interface SongListProps {
  songs: Track[];
  onLike?: (song: Track) => void;
  onMore?: (song: Track) => void;
  currentSongId?: string;
}

const SongList: FC<SongListProps> = ({ songs, onLike, onMore, currentSongId }) => {
  const { player } = useApp();
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No songs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <SongItem
          key={'song' + index}
          song={song}
          onPlay={player?.play}
          onLike={onLike}
          onMore={onMore}
          isPlaying={song.id != undefined && song.id === currentSongId}
        />
      ))}
    </div>
  );
};

export default SongList;