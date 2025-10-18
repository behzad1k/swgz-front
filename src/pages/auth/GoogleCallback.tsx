import { FC, useEffect } from 'react';
import { useNavigate } from '@/router/hooks';
import ApiService from '@/utils/api';

const GoogleCallback: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google/callback?code=${code}`);
          const data = await response.json();

          if (data.access_token) {
            ApiService.setToken(data.access_token);
            navigate('/');
          }
        } catch (error) {
          console.error('Google auth error:', error);
          navigate('/login');
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 flex items-center justify-center">
      <div className="text-white text-xl">Completing sign in...</div>
    </div>
  );
};

export default GoogleCallback;