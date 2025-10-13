import { Heart, MessageCircle, Repeat } from 'lucide-react';
import { FC } from 'react';
import { Activity } from '@/types/models.ts';
import SongItem from '../music/SongItem';

interface ActivityCardProps {
  activity: Activity;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
}

const ActivityCard: FC<ActivityCardProps> = ({ activity, onLike, onComment, onRepost }) => {
  const activityTypes = {
    like: 'liked a song',
    repost: 'reposted',
    comment: 'commented on',
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={activity.user?.avatarUrl || 'https://via.placeholder.com/40'}
          alt={activity.user?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-white font-medium">{activity.user?.username}</p>
          <p className="text-gray-400 text-sm">{activityTypes[activity.type]}</p>
        </div>
        <span className="text-gray-500 text-sm">{activity.timestamp}</span>
      </div>

      {activity.content && (
        <p className="text-gray-300 text-sm">{activity.content}</p>
      )}

      {activity.song && (
        <SongItem
          song={activity.song}
          onPlay={() => {}}
        />
      )}

      <div className="flex items-center gap-4 pt-2">
        {onLike && (
          <button onClick={onLike} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
            <Heart size={18} />
            <span className="text-sm">Like</span>
          </button>
        )}
        {onComment && (
          <button onClick={onComment} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
            <MessageCircle size={18} />
            <span className="text-sm">Comment</span>
          </button>
        )}
        {onRepost && (
          <button onClick={onRepost} className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
            <Repeat size={18} />
            <span className="text-sm">Repost</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;