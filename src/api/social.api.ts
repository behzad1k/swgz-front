import ApiService from '@utils/api';

export const socialApi = {
  stalk: (userId: string) => ApiService.post(`/social/stalk/${userId}`, {}),
  unstalk: (userId: string) => ApiService.delete(`/social/stalk/${userId}`),
  getMyStalkings: () => ApiService.get('/social/stalkings'),
  getMyStalkers: () => ApiService.get('/social/stalkers'),
  getUserStalkings: (userId: string) => ApiService.get(`/social/user/${userId}/stalkings`),
  getUserStalkers: (userId: string) => ApiService.get(`/social/user/${userId}/stalkers`),
  repost: (songId: string) => ApiService.post(`/social/repost/${songId}`, {}),
  unrepost: (songId: string) => ApiService.delete(`/social/repost/${songId}`),
  getUserReposts: (userId: string) => ApiService.get(`/social/user/${userId}/reposts`),
  getHomeFeed: (page: number, limit: number) => ApiService.get(`/social/feed?page=${page}&limit=${limit}`),
  getUserActivity: (userId: string) => ApiService.get(`/social/activity/${userId}`),
};