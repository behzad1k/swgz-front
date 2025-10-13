import { FC } from 'react';
import { Track } from '@/types/models.ts';
import SongItem from '../music/SongItem';

interface QueueListProps {
  queue: Track[];
  currentSongId?: string;
  onPlay: (song: Track) => void;
  onRemove?: (song: Track) => void;
}

const QueueList: FC<QueueListProps> = ({ queue, currentSongId, onPlay, onRemove }) => {
  console.log(onRemove);
  if (queue.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Queue is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-white mb-4">Up Next</h3>
      {queue.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          onPlay={onPlay}
          isPlaying={song.id === currentSongId}
        />
      ))}
    </div>
  );
};

export default QueueList;