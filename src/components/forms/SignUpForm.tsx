import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Mail, Lock, User } from '@/assets/svg';

interface SignUpFormProps {
  onSubmit: (username: string, email: string, password: string) => void;
  onGoogleSignUp?: () => void;
  loading?: boolean;
}

const SignUpForm: FC<SignUpFormProps> = ({ onSubmit, onGoogleSignUp, loading = false }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit(username, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={setUsername}
        icon={<img src={User} alt={getAltFromPath(User)} width={20} />}
      />
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
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        icon={<img src={Lock} alt={getAltFromPath(Lock)} width={20} />}
      />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      {onGoogleSignUp && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <Button variant="secondary" className="w-full" size="lg" onClick={onGoogleSignUp}>
            Sign up with Google
          </Button>
        </>
      )}
    </form>
  );
};

export default SignUpForm;