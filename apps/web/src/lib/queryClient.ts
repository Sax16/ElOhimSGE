import { QueryClient } from '@tanstack/react-query';

// Cliente único de TanStack Query para toda la app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
