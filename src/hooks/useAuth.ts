import { useState, useEffect } from 'react';
import { authApi } from '@/api/auth.api';
import ApiService from '@/utils/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = ApiService.getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      ApiService.setToken(response.accessToken);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.signUp({ username, email, password });
      ApiService.setToken(response.accessToken);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, loading, user, login, signup, logout };
};

export default useAuth;