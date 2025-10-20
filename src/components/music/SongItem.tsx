import { BookMinus, BookPlus, Heart, ListPlus, MoveVertical, Pause, Play } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, ReactNode } from 'react';
import { Track } from '@/types/models.ts';

type TrackAction = {
  icon: string;
  alt: string;
  onClick: (song: Track, e: React.MouseEvent) => void;
  tooltip?: string;
  className?: string;
  isActive?: boolean;
  activeClassName?: string;
  show?: boolean; // conditionally show action
};

export interface TrackItemProps {
  song: Track;
  onPlay: (song: Track) => void;
  isPlaying?: boolean;
  actions?: TrackAction[];
}

const TrackItem: FC<TrackItemProps> = ({ song, onPlay, isPlaying = false, actions = [] }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl h-20 hover:bg-white/5 transition-all duration-200 cursor-pointer group">
      <div className="relative flex-shrink-0">
        <img
          src={song.albumCover || 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'}
          alt={song.title}
          className="w-14 h-14 rounded-lg object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? (
            <img src={Pause} alt={getAltFromPath(Pause)} width={24} className="text-white" />
          ) : (
            <img src={Play} alt={getAltFromPath(Play)} width={24} className="text-white fill-white" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{song.title}</h4>
        <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
        <p className="text-gray-400 text-sm truncate">{song.albumName}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {actions.map((action, index) => {
          // Skip if show is false
          if (action.show === false) return null;

          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(song, e);
              }}
              className="hover:bg-white/10 rounded-full transition-colors p-1"
              title={action.tooltip}
            >
              <img
                src={action.icon}
                alt={action.alt}
                width={25}
                className={`${action.className || 'text-gray-400'} ${
                  action.isActive && action.activeClassName ? action.activeClassName : ''
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrackItem;