import { Heart, MoreVertical, Pause, Play } from 'lucide-react';
import { FC } from 'react';
import { Track } from '@/types/models.ts';

export interface TrackItemProps {
  song: Track;
  onPlay: (song: Track) => void;
  onLike?: (song: Track) => void;
  onMore?: (song: Track) => void;
  isPlaying?: boolean;
}

const TrackItem: FC<TrackItemProps> = ({ song, onPlay, onLike, onMore, isPlaying = false }) => {
  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer">
      <div className="relative flex-shrink-0">
        <img src={song.albumCover || 'https://via.placeholder.com/60'} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); console.log(song); onPlay(song); }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white fill-white" />}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{song.title}</h4>
        <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
        <p className="text-gray-400 text-sm truncate">{song.albumName}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onLike && (
          <button onClick={(e) => { e.stopPropagation(); onLike(song); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Heart size={20} className={song.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
        )}
        {onMore && (
          <button onClick={(e) => { e.stopPropagation(); onMore(song); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical size={20} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TrackItem;