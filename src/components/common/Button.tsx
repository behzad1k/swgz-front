import { FC, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  onClick?: (e?: any) => void;
  className?: string;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button';
}

const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/10',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    custom: '',
  };
  const sizes = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
