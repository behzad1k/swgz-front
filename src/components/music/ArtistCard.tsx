import { FC } from 'react';
import { Artist } from '@/types/models.ts';

interface ArtistCardProps {
  artist: Artist;
  onClick: (artist: Artist) => void;
}

const ArtistCard: FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <div
      onClick={() => onClick(artist)}
      className="group bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
    >
      <div className="relative mb-4">
        <img
          src={artist.image || 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'}
          alt={artist.name}
          className="w-full aspect-square rounded-full object-cover"
        />
      </div>
      <h3 className="text-white font-semibold text-center truncate">{artist.name}</h3>
      <p className="text-gray-400 text-sm text-center truncate">{artist?.externalListeners?.toLocaleString()} listeners</p>
    </div>
  );
};

export default ArtistCard;