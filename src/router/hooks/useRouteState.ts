import { useRouter } from './useRouter';

export const useIsActive = (path: string, exact = false): boolean => {
  const { currentPath } = useRouter();

  if (exact) {
    return currentPath === path;
  }

  return currentPath.startsWith(path);
};

export const useMatchPath = (pattern: string): boolean => {
  const { currentPath } = useRouter();

  const paramPattern = pattern.replace(/:\w+/g, '[^/]+');
  const regex = new RegExp(`^${paramPattern}$`);

  return regex.test(currentPath);
};