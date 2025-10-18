import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Mail, Lock } from '@/assets/svg';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  loading?: boolean;
}

const LoginForm: FC<LoginFormProps> = ({ onSubmit, onGoogleLogin, loading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        icon={<img src={Mail} alt={getAltFromPath(Mail)} width={20} />}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        icon={<img src={Lock} alt={getAltFromPath(Lock)} width={20} />}
      />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      {onGoogleLogin && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <Button variant="secondary" className="w-full" size="lg" onClick={onGoogleLogin}>
            Continue with Google
          </Button>
        </>
      )}
    </form>
  );
};

export default LoginForm;