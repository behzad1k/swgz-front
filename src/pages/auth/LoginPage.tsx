import { routes } from '@/config/routes.config.ts';
import { useNavigate } from '@/router';
import { AuthResponse } from '@/types/api';
import { useAuthActions } from '@hooks/actions/useAuthActions.ts';
import { useIsAuthenticated } from '@hooks/selectors/useAuthSelectors.ts';
import { getAltFromPath } from '@utils/helpers.ts';
import { validateEmail, validatePassword, validateUsername } from '@utils/validators.ts';
import { FC, useEffect, useState } from 'react';
import { Music } from '@/assets/svg';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { authApi } from '@/api/auth.api';
import ApiService from '@/utils/api';

const DEFAULT_RESULT_MESSAGES = {
  success: false,
  message: '',
}

const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(DEFAULT_RESULT_MESSAGES);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const isAuthenticated = useIsAuthenticated()
  const { login } = useAuthActions();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameValidation = validateUsername(username);
    if (isSignUp && !usernameValidation.isValid) {
      newErrors.username = usernameValidation.error || 'Invalid username';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    setResultMessage({ success: false, message: Object.values(newErrors).reduce((acc, curr, index) => acc + (index > 0 ? ' and ': '') + curr, '') });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setResultMessage(DEFAULT_RESULT_MESSAGES);

    try {
      let response: AuthResponse;
      if (isSignUp) {
        response = await authApi.signUp({ username, email, password });
        setResultMessage({ success: true, message: response.message });
      } else {
        response = await authApi.login({ email, password });
        ApiService.setToken(response.accessToken);
        login(response.accessToken, response.user)
        navigate(routes.library.path)
      }
    } catch (err: any) {
      setResultMessage({ success: false, message: err.message || 'Authentication failed'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate(routes.library.path)
  },[])

  const handleGoogleAuth = () => {
    authApi.googleAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={Music} alt={getAltFromPath(Music)} width={48} className="text-purple-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">swgz </h1>
          <p className="text-gray-400">Your premium music experience</p>
        </div>

        {resultMessage.message && (
          <div className={`${resultMessage.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'} rounded-xl p-3 mb-4`}>
            <p className={`${resultMessage.success ? 'text-green-400' : 'text-red-400'} text-sm text-left`}>{resultMessage.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              placeholder="Username"
              value={username}
              onChange={setUsername}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
          />
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Button variant="secondary" className="w-full" size="lg" disabled onClick={handleGoogleAuth}>
          Continue with Google (Soon)
        </Button>

        <p className="text-center mt-6 text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setResultMessage(DEFAULT_RESULT_MESSAGES);
            }}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;