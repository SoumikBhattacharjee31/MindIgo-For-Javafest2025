// hooks/useSessionCacheManager.ts
import { useEffect } from 'react';
import { sessionCache } from '@/util/sessionCache';

/**
 * Hook to manage session cache lifecycle
 * This hook can be used in layout components or auth contexts to manage session cache
 */
export const useSessionCacheManager = () => {
  /**
   * Clear session cache (useful for logout)
   */
  const clearSessionCache = () => {
    sessionCache.invalidateCache();
  };

  /**
   * Get cache information for debugging
   */
  const getCacheInfo = () => {
    return sessionCache.getCacheInfo();
  };

  /**
   * Check if there's a cached session available
   */
  const hasCachedSession = () => {
    return sessionCache.hasCachedSession();
  };

  return {
    clearSessionCache,
    getCacheInfo,
    hasCachedSession,
  };
};

/**
 * Hook to automatically clear session cache when user context changes
 * This should be used in the app layout or auth context
 */
export const useSessionCacheWatcher = () => {
  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // If auth-related localStorage items change, check if we need to clear cache
      if (e.key === 'userId' || e.key === 'userEmail' || e.key === 'authToken') {
        console.log('Auth storage changed, session cache may need invalidation');
        // The sessionCache utility will handle checking if context changed
        // when getCachedSession() is next called
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    clearSessionCache: () => sessionCache.invalidateCache(),
  };
};