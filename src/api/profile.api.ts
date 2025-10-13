import ApiService from '@utils/api';
import { UserProfile } from '@/types/models.ts';

export const profileApi = {
  searchStalkers: (query: string) => ApiService.get<UserProfile[]>(`/profile/search?q=${encodeURIComponent(query)}`),
  getProfile: (username: string) => ApiService.get(`/profile/${username}`),
  getProfileActivity: (username: string) => ApiService.get(`/profile/${username}/activity`),
  updateMyProfile: (data: Partial<UserProfile>) => ApiService.put<UserProfile>('/profile/me', data),
};