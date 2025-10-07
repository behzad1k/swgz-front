import React, { FC, ReactNode } from 'react';


interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  className?: string;
}

const Input: FC<InputProps> = ({ type = 'text', placeholder, value, onChange, icon, className = '' }) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 ${icon ? 'pl-10' : ''} text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${className}`}
      />
    </div>
  );
};

export default Input;