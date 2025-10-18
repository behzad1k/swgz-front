import { useAuthContext } from '@/contexts/AuthContext';
import { AuthActionKeys } from '@store/authSlice.ts';
import { UserProfile } from '@/types/models';
import { useCallback } from 'react';

export const useAuthActions = () => {
  const { dispatch } = useAuthContext();

  const setToken = useCallback(
    (token: string | null) => {
      dispatch({ type: AuthActionKeys.SET_TOKEN, payload: token });
    },
    [dispatch]
  );

  const setUser = useCallback(
    (user: UserProfile | null) => {
      dispatch({ type: AuthActionKeys.SET_USER, payload: user });
    },
    [dispatch]
  );

  const setIsAuthenticated = useCallback(
    (isAuthenticated: boolean) => {
      dispatch({ type: AuthActionKeys.SET_IS_AUTHENTICATED, payload: isAuthenticated });
    },
    [dispatch]
  );

  const login = useCallback(
    (token: string, user: UserProfile) => {
      dispatch({ type: AuthActionKeys.LOGIN, payload: { token, user } });
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch({ type: AuthActionKeys.LOGOUT });
  }, [dispatch]);

  return {
    setToken,
    setUser,
    setIsAuthenticated,
    login,
    logout,
  };
};