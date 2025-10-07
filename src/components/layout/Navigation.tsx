import { Home, Library, Search, User } from 'lucide-react';
import { FC } from 'react';

const Navigation: FC = () => {
  const { state, dispatch } = useApp();
  const navItems: Array<{ id: 'home' | 'search' | 'library' | 'profile'; label: string; icon: typeof Home }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 z-30">
      <div className="flex justify-around items-center h-20 px-4 max-w-4xl mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => dispatch({ type: 'SET_APP', payload: { currentPage: id } })} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${state.app.currentPage === id ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}>
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
