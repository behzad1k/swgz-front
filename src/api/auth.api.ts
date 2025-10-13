import { UserProfile } from '@/types/models.ts';
import ApiService from '@utils/api';
import { AuthResponse, LoginCredentials, SignUpData } from '@/types/api';
import ENDPOINTS from '@utils/endpoints.ts';

export const authApi = {
  confirmEmail: (data: { token: string }, signal?: AbortSignal) => ApiService.post<AuthResponse>(ENDPOINTS.AUTH.CONFIRM_EMAIL, data, signal),
  signUp: (data: SignUpData, signal?: AbortSignal) => ApiService.post<AuthResponse>(ENDPOINTS.AUTH.SIGN_UP, data, signal),
  login: (credentials: LoginCredentials, signal?: AbortSignal) => ApiService.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials, signal),
  getUser: () => ApiService.get<UserProfile>(ENDPOINTS.AUTH.USER),
  googleAuth: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  },
};