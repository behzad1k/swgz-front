import { User } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: FC<AvatarProps> = ({ src, alt = 'Avatar', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (!src) {
    return (
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ${className}`}>
        <img src={User} alt={getAltFromPath(User)} width={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48} className="text-white" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover ${className}`}
    />
  );
};

export default Avatar;