import { AuthState } from '@/types/states.ts';

export const initialAuthState: AuthState = {
  token: localStorage.getItem('auth_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
};