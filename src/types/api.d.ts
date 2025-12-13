import { Activity, UserProfile } from './models';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends LoginCredentials {
  username: string;
}

export interface UserResponse extends LoginCredentials {
  profile: UserProfile;
  activity: Activity[];
}
