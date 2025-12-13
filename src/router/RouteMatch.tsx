export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  exact?: boolean;
}

/**
 * Improved path matching with better param extraction
 * Handles multiple params like /user/:id/post/:postId
 */
export const matchPath = (pattern: string, pathname: string, exact = false): RouteMatch | null => {
  // Clean paths
  const cleanPattern = pattern.replace(/\/$/, '') || '/';
  const cleanPathname = pathname.replace(/\/$/, '') || '/';

  // Handle exact matches first
  if (exact && cleanPattern === cleanPathname) {
    return { path: cleanPathname, params: {} };
  }

  // Split into segments
  const patternSegments = cleanPattern.split('/').filter(Boolean);
  const pathnameSegments = cleanPathname.split('/').filter(Boolean);

  // For exact matches, lengths must match
  if (exact && patternSegments.length !== pathnameSegments.length) {
    return null;
  }

  // For non-exact matches, pathname must have at least as many segments
  if (!exact && pathnameSegments.length < patternSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  // Match each segment
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathnameSegment = pathnameSegments[i];

    // Handle wildcard
    if (patternSegment === '*') {
      continue;
    }

    // Handle param segment (starts with :)
    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1);

      if (!pathnameSegment) {
        return null;
      }

      // Decode the param value
      try {
        params[paramName] = decodeURIComponent(pathnameSegment);
      } catch {
        params[paramName] = pathnameSegment;
      }
      continue;
    }

    // Regular segment - must match exactly
    if (patternSegment !== pathnameSegment) {
      return null;
    }
  }

  // For exact matches, ensure no extra segments in pathname
  if (exact && pathnameSegments.length > patternSegments.length) {
    return null;
  }

  return { path: cleanPathname, params };
};

/**
 * Helper to build path with params
 * Example: buildPathWithParams('/user/:id/post/:postId', { id: '123', postId: '456' })
 * Returns: '/user/123/post/456'
 */
export const buildPathWithParams = (
  pattern: string,
  params: Record<string, string | number>
): string => {
  let path = pattern;

  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  });

  return path;
};

/**
 * Helper to extract params from a path given a pattern
 * Example: extractParams('/user/:id/post/:postId', '/user/123/post/456')
 * Returns: { id: '123', postId: '456' }
 */
export const extractParams = (pattern: string, pathname: string): Record<string, string> | null => {
  const match = matchPath(pattern, pathname);
  return match ? match.params : null;
};
