import { Bell, Settings, User } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

interface HeaderProps {
  title: string;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

const Header: FC<HeaderProps> = ({ title, onSettingsClick, onProfileClick }) => {
  return (
    <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <img src={Bell} alt={getAltFromPath(Bell)} width={20} className="text-gray-400" />
          </button>
          {onSettingsClick && (
            <button onClick={onSettingsClick} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <img src={Settings} alt={getAltFromPath(Settings)} width={20} className="text-gray-400" />
            </button>
          )}
          {onProfileClick && (
            <button onClick={onProfileClick} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <img src={User} alt={getAltFromPath(User)} width={20} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;