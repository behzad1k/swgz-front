// hooks/useAuthSelectors.ts
import { useAuthContext } from '@/contexts/AuthContext';

export const useAuthState = () => {
  const { state } = useAuthContext();
  return state;
};

export const useAuthToken = () => {
  const { state } = useAuthContext();
  return state.token;
};

export const useCurrentUser = () => {
  const { state } = useAuthContext();
  return state.user;
};

export const useIsAuthenticated = () => {
  const { state } = useAuthContext();
  return state.isAuthenticated;
};