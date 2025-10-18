import { BookMinus, BookPlus, Heart, ListPlus, MoveVertical, Pause, Play } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';
import { Track } from '@/types/models.ts';

export interface TrackItemProps {
  song: Track;
  onPlay: (song: Track) => void;
  onLike?: (song: Track) => void;
  onMore?: (song: Track) => void;
  onToggleLibrary?: (song: Track) => void;
  songInLibrary?: boolean;
  isLiked?: boolean;
  isPlaying?: boolean;
  onQueueNext?: (song: Track) => void;
}

const TrackItem: FC<TrackItemProps> = ({ song, onPlay, onLike, onMore, onQueueNext, onToggleLibrary, isLiked, songInLibrary, isPlaying = false }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl h-20 hover:bg-white/5 transition-all duration-200 cursor-pointer">
      <div className="relative flex-shrink-0">
        <img src={song.albumCover || 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png'} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); console.log(song); onPlay(song); }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? <img src={Pause} alt={getAltFromPath(Pause)} width={24} className="text-white" /> : <img src={Play} alt={getAltFromPath(Play)} width={24} className="text-white fill-white" />}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{song.title}</h4>
        <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
        <p className="text-gray-400 text-sm truncate">{song.albumName}</p>
      </div>
      <div className="flex items-center group-hover:opacity-100 gap-1 transition-opacity">
        {onQueueNext &&
            <button onClick={(e) => { e.stopPropagation(); onQueueNext(song); }} className="hover:bg-white/10 rounded-full transition-colors">
                <img src={ListPlus} alt={getAltFromPath(ListPlus)} width={25} className="text-gray-700 hover:bg-gray-300"/>
            </button>
        }
        {onLike && (
          <button onClick={(e) => { e.stopPropagation(); onLike(song); }} className="hover:bg-white/10 rounded-full transition-colors">
            <img src={Heart} alt={getAltFromPath(Heart)} width={25} className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 stroke-1 stroke-red-600'} />
          </button>
        )}
        {onToggleLibrary &&
          <button onClick={(e) => { e.stopPropagation(); onToggleLibrary(song); }} className=" hover:bg-white/10 rounded-full transition-colors">
            {songInLibrary ?
              <img src={BookMinus} alt={getAltFromPath(BookMinus)} width={25} className={'stroke-red-300 text-red-300'}/> :
              <img src={BookPlus} alt={getAltFromPath(BookPlus)} width={25}  className={'stroke-green-200 text-green-200'}/>
            }
          </button>
        }
        {onMore && (
          <button onClick={(e) => { e.stopPropagation(); onMore(song); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <img src={MoveVertical} alt={getAltFromPath(MoveVertical)} width={20} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TrackItem;