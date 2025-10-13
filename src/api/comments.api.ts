import ApiService from '@utils/api';

export const commentsApi = {
  createComment: (data: { songId: string; content: string; parentCommentId?: string }) => ApiService.post('/comments', data),
  getSongComments: (songId: string, page: number, limit: number) => ApiService.get(`/comments/song/${songId}?page=${page}&limit=${limit}`),
  getReplies: (commentId: string) => ApiService.get(`/comments/${commentId}/replies`),
  updateComment: (id: string, content: string) => ApiService.put(`/comments/${id}`, { content }),
  deleteComment: (id: string) => ApiService.delete(`/comments/${id}`),
};