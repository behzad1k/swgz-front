import { Track } from '@/types/models.ts';
import { TrackItemProps } from '@components/music/SongItem.tsx';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { useIsPlaying } from '@hooks/selectors/usePlayerSelectors.ts';
import { Heart, Menu, Pause, Play } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

interface DraggableSongItemProps extends TrackItemProps {
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onLike: (track: Track) => void;
}

const DraggableSongItem: FC<DraggableSongItemProps> = ({ song, index, onLike, onDragStart, onDragOver, onDrop }) => {
  const isPlaying = useIsPlaying();
  const { play } = usePlayerActions();
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-move"
    >
      <div className="text-gray-400 text-sm w-6">{index + 1}</div>
      <div className="relative flex-shrink-0">
        <img src={song.albumCover || 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); play(song); }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? <img src={Pause} alt={getAltFromPath(Pause)} width={24} className="text-white" /> : <img src={Play} alt={getAltFromPath(Play)} width={24} className="text-white fill-white" />}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{song.title}</h4>
        <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
      </div>
      {onLike && (
        <button onClick={(e) => { e.stopPropagation(); onLike(song); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <img src={Heart} alt={getAltFromPath(Heart)} width={20} className={song.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>
      )}
      <div className="text-gray-400">
        <img src={Menu} alt={getAltFromPath(Menu)} width={20} />
      </div>
    </div>
  );
};

export default DraggableSongItem;
