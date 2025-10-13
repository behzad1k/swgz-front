import { FC } from 'react';
import { UserProfile } from '@/types/models.ts';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

interface UserCardProps {
  user: UserProfile;
  onStalk?: (user: UserProfile) => void;
  onView?: (user: UserProfile) => void;
  isStalkeding?: boolean;
}

const UserCard: FC<UserCardProps> = ({ user, onStalk, onView, isStalkeding = false }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
      <Avatar src={user.avatarUrl} alt={user.username} size="md" />
      <div className="flex-1 min-w-0" onClick={() => onView?.(user)}>
        <h4 className="text-white font-medium truncate cursor-pointer hover:text-purple-400 transition-colors">
          {user.username}
        </h4>
        <p className="text-gray-400 text-sm truncate">{user.bio || 'No bio'}</p>
      </div>
      {onStalk && (
        <Button size="sm" variant="secondary" onClick={() => onStalk(user)}>
          {isStalkeding ? 'Unstalk' : 'Stalk'}
        </Button>
      )}
    </div>
  );
};

export default UserCard;