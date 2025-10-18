import { Play } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';
import { Album } from '@/types/models.ts';

interface AlbumCardProps {
  album: Album;
  onClick: (album: Album) => void;
}

const AlbumCard: FC<AlbumCardProps> = ({ album, onClick }) => {
  return (
    <div
      onClick={() => onClick(album)}
      className="group bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
    >
      <div className="relative mb-4">
        <img
          src={album.albumCover || 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'}
          alt={album.title}
          className="w-full aspect-square rounded-lg object-cover"
        />
        <button className="absolute bottom-2 right-2 bg-purple-500 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <img src={Play} alt={getAltFromPath(Play)} width={20} className="text-white fill-white" />
        </button>
      </div>
      <h3 className="text-white font-semibold truncate">{album.title}</h3>
      <p className="text-gray-400 text-sm truncate">{album.artistName} {album?.releaseDate}</p>
    </div>
  );
};

export default AlbumCard;