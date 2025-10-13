import { ChevronDown } from 'lucide-react';
import { FC, ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Dropdown: FC<DropdownProps> = ({ options, value, onChange, placeholder = 'Select...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;