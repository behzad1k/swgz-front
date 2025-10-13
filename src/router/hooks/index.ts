// Core
export { useRouter } from './useRouter';

// Navigation - simplified, matching React Router
export {
  useNavigate,
  useBack,      // Convenience wrapper for navigate(-1)
  useForward    // Convenience wrapper for navigate(1)
} from './useNavigation';

// Route Data
export { useParams, useQuery, useLocation } from './useRouteData';

// Route State
export { useIsActive, useMatchPath } from './useRouteState';

// Current Route
export { useCurrentRoute } from './useCurrentRoute';

// Advanced
export {
  useRouteChange,
  useScrollRestoration,
  useSearchParam,
  useSetSearchParams
} from './useRouteEvents';