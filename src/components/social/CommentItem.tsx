import { Heart, MessageCircle, MoveVertical } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

interface Comment {
  id: string;
  content: string;
  user: {
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  likes?: number;
  replyCount?: number;
}

interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
  onLike?: () => void;
  onMore?: () => void;
}

const CommentItem: FC<CommentItemProps> = ({ comment, onReply, onLike, onMore }) => {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <img
        src={comment.user.avatarUrl || 'https://via.placeholder.com/40'}
        alt={comment.user.username}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium">{comment.user.username}</span>
          <span className="text-gray-500 text-xs">{comment.createdAt}</span>
        </div>
        <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
        <div className="flex items-center gap-4">
          {onLike && (
            <button onClick={onLike} className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
              <img src={Heart} alt={getAltFromPath(Heart)} width={14} />
              {comment.likes && <span className="text-xs">{comment.likes}</span>}
            </button>
          )}
          {onReply && (
            <button onClick={onReply} className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
              <img src={MessageCircle} alt={getAltFromPath(MessageCircle)} width={14} />
              {comment.replyCount && <span className="text-xs">{comment.replyCount}</span>}
            </button>
          )}
        </div>
      </div>
      {onMore && (
        <button onClick={onMore} className="text-gray-400 hover:text-white transition-colors">
          <img src={MoveVertical} alt={getAltFromPath(MoveVertical)} width={18} />
        </button>
      )}
    </div>
  );
};

export default CommentItem;