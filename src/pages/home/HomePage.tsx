import { Users } from 'lucide-react';
import { FC } from 'react';

const HomePage: FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white">Home Feed</h1>
      <div className="text-center py-12 text-gray-400">
        <Users size={48} className="mx-auto mb-4 opacity-50" />
        <p>Start stalking users to see their activity!</p>
      </div>
    </div>
  );
};

export default HomePage;