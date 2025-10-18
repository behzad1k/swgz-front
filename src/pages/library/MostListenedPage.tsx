import { useMostListened } from '@hooks/selectors/useLibrarySelectors.ts';
import { TrendingUp } from '@/assets/svg';
import SongList from '@/components/music/SongList';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

const MostListenedPage: FC = () => {
  const mostListened = useMostListened();
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <img src={TrendingUp} alt={getAltFromPath(TrendingUp)} width={25}/>
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