// store/slices/authSlice.ts
import { UserProfile } from '@/types/models';
import { AuthState } from '@/types/states';

export const initialAuthState: AuthState = {
  token: localStorage.getItem('auth_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
};

export enum AuthActionKeys {
  SET_TOKEN = 'SET_TOKEN',
  SET_USER = 'SET_USER',
  SET_IS_AUTHENTICATED = 'SET_IS_AUTHENTICATED',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export type AuthAction =
  | { type: AuthActionKeys.SET_TOKEN; payload: string | null }
  | { type: AuthActionKeys.SET_USER; payload: UserProfile | null }
  | { type: AuthActionKeys.SET_IS_AUTHENTICATED; payload: boolean }
  | { type: AuthActionKeys.LOGIN; payload: { token: string; user: UserProfile } }
  | { type: AuthActionKeys.LOGOUT };

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionKeys.SET_TOKEN:
      if (action.payload) {
        localStorage.setItem('auth_token', action.payload);
      } else {
        localStorage.removeItem('auth_token');
      }
      return { ...state, token: action.payload };
    case AuthActionKeys.SET_USER:
      return { ...state, user: action.payload };
    case AuthActionKeys.SET_IS_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };
    case AuthActionKeys.LOGIN:
      localStorage.setItem('auth_token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };
    case AuthActionKeys.LOGOUT:
      localStorage.removeItem('auth_token');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};