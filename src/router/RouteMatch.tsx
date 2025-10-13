export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  exact?: boolean;
}

export const matchPath = (pattern: string, pathname: string, exact = false): RouteMatch | null => {
  // Remove trailing slashes
  const cleanPattern = pattern.replace(/\/$/, '') || '/';
  const cleanPathname = pathname.replace(/\/$/, '') || '/';

  // Exact match
  if (exact && cleanPattern === cleanPathname) {
    return { path: cleanPathname, params: {} };
  }

  // Convert route pattern to regex
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

  // Extract params
  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return { path: cleanPathname, params };
};