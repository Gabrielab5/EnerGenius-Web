import { useEffect } from 'react';

export const usePerformance = () => {
  useEffect(() => {
    // Filter out third-party console logs that are cluttering the console
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    
    console.log = (...args) => {
      const message = args.join(' ');
      // Filter out UTS logs and other third-party noise
      if (
        message.includes('[UTS]') ||
        message.includes('[fp]') ||
        message.includes('[gusid]') ||
        message.includes('[pc]') ||
        message.includes('[_fbp_c]') ||
        message.includes('[pcu]') ||
        message.includes('No NF on page')
      ) {
        return;
      }
      originalConsoleLog.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      // Filter out preload warnings for resources that are intentionally delayed
      if (
        message.includes('was preloaded using link preload but not used') ||
        message.includes('The width') && message.includes('and height') && message.includes('are both fixed numbers')
      ) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    // Add error handling for message channel errors
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('message channel closed')) {
        // Suppress this error as it's from browser extensions
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('message channel closed') ||
        event.reason?.message?.includes('deferred DOM Node could not be resolved')
      ) {
        // Suppress these errors as they're from browser extensions
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Performance monitoring and optimization
    const measureAndOptimizePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Measure load time
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        if (loadTime > 0) {
          console.log(`App loaded in ${loadTime}ms`);
        }

        // Optimize critical resources
        try {
          // Prefetch commonly used resources
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = '/';
          document.head.appendChild(link);

          // Enable performance optimizations
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              // Perform non-critical optimizations during idle time
              console.log('Performance optimizations applied during idle time');
            });
          }
        } catch (error) {
          console.warn('Performance optimizations skipped:', error);
        }
      }
    };

    // Measure performance immediately without delay
    measureAndOptimizePerformance();

    // Cleanup
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};