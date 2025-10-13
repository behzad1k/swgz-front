import { useApp } from '@/contexts/AppContext.tsx';
import { MostListened } from '@/types/states.ts';
import { TrendingUp } from 'lucide-react';
import SongList from '@/components/music/SongList';
import { FC, useState } from 'react';

const MostListenedPage: FC = () => {
  const { state } = useApp()
  const [mostListened, _setMostListened] = useState<MostListened[]>(state.library.mostListened);
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <TrendingUp size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Most Listened</h1>
          <p className="text-gray-400">Your top tracks</p>
        </div>
      </div>

      <SongList songs={mostListened.map(e => e.song)} />
    </div>
  );
};

export default MostListenedPage;