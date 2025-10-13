import { FC } from 'react';
import CommentItem from './CommentItem';

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

interface CommentListProps {
  comments: Comment[];
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
}

const CommentList: FC<CommentListProps> = ({ comments, onReply, onLike }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No comments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={() => onReply?.(comment.id)}
          onLike={() => onLike?.(comment.id)}
        />
      ))}
    </div>
  );
};

export default CommentList;