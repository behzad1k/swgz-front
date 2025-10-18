export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  exact?: boolean;
}

export const matchPath = (pattern: string, pathname: string, exact = false): RouteMatch | null => {
  const cleanPattern = pattern.replace(/\/$/, '') || '/';
  const cleanPathname = pathname.replace(/\/$/, '') || '/';

  if (exact && cleanPattern === cleanPathname) {
    return { path: cleanPathname, params: {} };
  }

  const paramNames: string[] = [];
  const regexPattern = cleanPattern
  .split('/')
  .map((segment) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      paramNames.push(paramName);
      return '([^/]+)';
    }
    if (segment === '*') {
      return '.*';
    }
    return segment;
  })
  .join('/');

  const regex = new RegExp(`^${regexPattern}${exact ? '$' : ''}`);
  const match = cleanPathname.match(regex);

  if (!match) {
    return null;
  }

  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return { path: cleanPathname, params };
};