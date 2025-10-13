import { useRouter } from './useRouter';

/**
 * Hook for programmatic navigation (matches React Router API)
 * @example
 * const navigate = useNavigate();
 *
 * // Navigate to a path
 * navigate('/home');
 *
 * // Navigate with options
 * navigate('/home', { replace: true });
 * navigate('/profile', { state: { from: 'dashboard' } });
 *
 * // Navigate back/forward with numbers
 * navigate(-1);  // Go back
 * navigate(1);   // Go forward
 * navigate(-2);  // Go back 2 pages
 */
export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

/**
 * Convenience hook to go back (same as navigate(-1))
 */
export const useBack = () => {
  const { back } = useRouter();
  return back;
};

/**
 * Convenience hook to go forward (same as navigate(1))
 */
export const useForward = () => {
  const { forward } = useRouter();
  return forward;
};