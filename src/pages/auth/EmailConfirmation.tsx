import { AuthResponse } from '@/types/api';
import { FC, useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';


const DEFAULT_RESULT_MESSAGES = {
  success: false,
  message: '',
}

const EmailConfirmation: FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(DEFAULT_RESULT_MESSAGES);

  const submitEmailCode = async (token: string) => {
    if (!token) return;

    setLoading(true);
    setResult(DEFAULT_RESULT_MESSAGES);

    try {
      await authApi.confirmEmail({ token });

      setResult({ success: true, message: 'Your email done been confirmed. Login with your credentials rn' })
    } catch (err: any) {
      console.log(err);
      setResult({ success: false, message: err.message || 'Authentication failed'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const url = new URLSearchParams(window.location.search)
    submitEmailCode(url.get('token'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Music size={48} className="text-purple-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">swgz</h1>
          <p className="text-gray-400">Your premium music experience</p>
        </div>

        {result.message && (
          <div className={`${result.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'} rounded-xl p-3 mb-4`}>
            <p className={`${result.success ? 'text-green-400' : 'text-red-400'} text-sm text-left`}>{result.message}</p>
          </div>
        )}

        <Button variant="secondary" className="w-full" size="lg" onClick={() => { window.location.href = '/login' }}>
          Login
        </Button>
      </div>
    </div>
  );
};

export default EmailConfirmation;