import { Playlist } from '@/types/models.ts';
import { Play } from 'lucide-react';
import { FC } from 'react';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (playlist: Playlist) => void;
}

const PlaylistCard: FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  return (
    <div
      onClick={() => onClick(playlist)}
      className="group bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
    >
      <div className="relative mb-4">
        <img src={playlist.coverUrl || 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'} alt={playlist.name} className="w-full aspect-square rounded-lg object-cover" />
        <button className="absolute bottom-2 right-2 bg-purple-500 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <Play size={20} className="text-white fill-white" />
        </button>
      </div>
      <h3 className="text-white font-semibold truncate">{playlist.name}</h3>
      <p className="text-gray-400 text-sm truncate">{playlist.description || `${playlist.songCount || 0} songs`}</p>
    </div>
  );
};

export default PlaylistCard;