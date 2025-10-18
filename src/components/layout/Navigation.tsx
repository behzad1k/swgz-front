import { useIsActive, useNavigate } from '@/router';
import { useIsPlaying } from '@hooks/selectors/usePlayerSelectors.ts';
import { Search, Library, User } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';

const Navigation = () => {
  const navigate = useNavigate();
  const isSearchActive = useIsActive('/search');
  const isLibraryActive = useIsActive('/library');
  const isProfileActive = useIsActive('/profile');
  const isMusicPlaying = useIsPlaying()

  const navItems = [
    // { path: '/home', icon: Home, label: 'Home', isActive: isHomeActive },
    { path: '/library', icon: Library, label: 'Library', isActive: isLibraryActive },
    { path: '/search', icon: Search, label: 'Search', isActive: isSearchActive },
    { path: '/profile', icon: User, label: 'Profile', isActive: isProfileActive },
  ];

  return (
    <nav className={`fixed ${isMusicPlaying ? 'bottom-32' : 'bottom-10'} right-5`}>
      <div className="flex flex-col justify-around items-center w-16 h-60">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-4 backdrop-blur-xl transition-colors bg-gray-600 rounded-full ${
                item.isActive ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <img src={Icon} alt={getAltFromPath(Icon)} />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;