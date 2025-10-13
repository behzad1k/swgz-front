import { useRouter } from '@/router/hooks';
import { FC, useEffect } from 'react';

interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: any;
}

export const Navigate: FC<NavigateProps> = ({ to, replace = false, state }) => {
  const { navigate } = useRouter();

  useEffect(() => {
    navigate(to, { replace, state });
  }, [to, replace, state, navigate]);

  return null;
};