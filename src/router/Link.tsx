import { useNavigate } from '@/router/hooks';
import { FC, MouseEvent, ReactNode } from 'react';

interface LinkProps {
  to: string;
  replace?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: FC<LinkProps> = ({
                                      to,
                                      replace = false,
                                      className,
                                      children,
                                      onClick
                                    }) => {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (onClick) {
      onClick(e);
    }

    navigate(to, { replace });
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};