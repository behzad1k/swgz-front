import { FC } from 'react';
import { Heart } from 'lucide-react';
import SongList from '@/components/music/SongList';

const LikedSongsPage: FC = () => {
  const songs: any[] = []
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Heart size={32} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Liked Songs</h1>
          <p className="text-gray-400">{songs.length} songs</p>
        </div>
      </div>

      <SongList songs={songs} />
    </div>
  );
};

export default LikedSongsPage;