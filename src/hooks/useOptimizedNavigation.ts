import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for optimized navigation that preloads routes and provides instant feedback
 */
export const useOptimizedNavigation = () => {
  const navigate = useNavigate();

  const optimizedNavigate = useCallback((to: string, options?: { replace?: boolean; state?: any }) => {
    // Provide immediate UI feedback by updating URL optimistically
    navigate(to, { ...options });
  }, [navigate]);

  const preloadRoute = useCallback((route: string) => {
    // Preload route resources in the background
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    } catch (error) {
      console.warn('Route preloading failed:', error);
    }
  }, []);

  return {
    navigate: optimizedNavigate,
    preloadRoute
  };
};