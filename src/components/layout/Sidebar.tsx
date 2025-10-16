import { Search, Library, Plus, Heart, Clock, TrendingUp } from 'lucide-react';
import { FC } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    // { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  const libraryItems = [
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'recent', label: 'Recently Played', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-gray-900 border-r border-white/10 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
          <span className="text-xl font-bold text-white">swgz </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={22} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white">
            <Plus size={22} />
            <span className="font-medium">Create Playlist</span>
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">Library</h3>
          <nav className="space-y-1">
            {libraryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;