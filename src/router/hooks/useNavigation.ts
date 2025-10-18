import { useRouter } from './useRouter';

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useBack = () => {
  const { back } = useRouter();
  return back;
};

export const useForward = () => {
  const { forward } = useRouter();
  return forward;
};