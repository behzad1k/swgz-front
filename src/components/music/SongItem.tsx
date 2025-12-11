import { getAltFromPath } from '@utils/helpers';
import { FC } from 'react';
import { MoveVertical, X } from '@/assets/svg';
import { Track } from '@/types/models';
import { TrackAction } from '@/types/global';

interface SongItemProps {
  song: Track;
  onPlay: (song: Track) => void;
  actions: TrackAction[];
  isPlaying?: boolean;
  index?: number;

  // Draggable props (optional)
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onRemove?: (songId: string) => void;
  showDragHandle?: boolean;
  showRemoveButton?: boolean;
}

const SongItem: FC<SongItemProps> = ({
  song,
  onPlay,
  actions,
  isPlaying = false,
  index,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onRemove,
  showDragHandle = false,
  showRemoveButton = false,
}) => {
  const defaultCover =
    'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png';

  const handleDragStart = (e: React.DragEvent) => {
    if (draggable && onDragStart && index !== undefined) {
      onDragStart(e, index);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (draggable && onDrop && index !== undefined) {
      onDrop(e, index);
    }
  };
  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={handleDrop}
      className={`group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all ${
        draggable ? 'cursor-move' : ''
      } ${isPlaying ? 'ring-2 ring-purple-500' : ''}`}
    >
      {/* Drag Handle (only shown when draggable) */}
      {showDragHandle && draggable && (
        <div className="text-gray-400">
          <img src={MoveVertical} alt={getAltFromPath(MoveVertical)} width={20} />
        </div>
      )}

      {/* Index Number (optional) */}
      {index !== undefined && <span className="text-gray-400 text-sm w-6">{index + 1}</span>}

      {/* Album Cover */}
      <img
        src={song.albumCover || defaultCover}
        alt={song.title}
        className="w-12 h-12 rounded-lg object-cover"
      />

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h4
          className="text-white font-medium truncate cursor-pointer hover:text-purple-400 transition-colors"
          onClick={() => onPlay(song)}
        >
          {song.title}
        </h4>
        <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
      </div>

      {/* Remove Button (only shown when enabled) */}
      {showRemoveButton && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(song.id || '');
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
          title="Remove from playlist"
        >
          <img src={X} alt="Remove" width={16} className="text-red-500" />
        </button>
      )}

      {/* Action Buttons (like/library/add to queue/etc) */}
      {!draggable && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(song, e);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={action.tooltip}
            >
              <img
                src={action.icon}
                alt={action.tooltip}
                width={20}
                className="text-gray-400 hover:text-white transition-colors"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongItem;
