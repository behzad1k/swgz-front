import { useRouter } from './useRouter';

export const useParams = () => {
  const { params } = useRouter();
  
  return params;
};

export const useQuery = () => {
  const { query } = useRouter();
  return query;
};

export const useLocation = () => {
  const { currentPath, query } = useRouter();
  return {
    pathname: currentPath,
    search: new URLSearchParams(query).toString(),
    query,
  };
};