import { Search, X } from 'lucide-react';
import { FC } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => any;
  placeholder?: string;
}

const SearchBar: FC<SearchBarProps> = ({ value, onChange, onSearch, placeholder = 'Search...' }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;