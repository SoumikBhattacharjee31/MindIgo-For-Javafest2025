// utils/sessionCache.ts

interface CachedSessionData {
  sessionId: string;
  userId: string | null;
  userEmail: string | null;
  timestamp: number;
  expiresAt: number;
}

class SessionCacheService {
  private readonly CACHE_KEY = "mindigo_chat_session_cache";
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly USER_CONTEXT_KEY = "mindigo_user_context";

  /**
   * Get current user context from localStorage (similar to the game's user service)
   */
  private getCurrentUserContext() {
    if (typeof window === "undefined") return null;

    try {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");
      const authToken = localStorage.getItem("authToken");

      // If no auth data exists, return null
      if (!userId && !userEmail && !authToken) {
        return null;
      }

      return {
        userId: userId || null,
        userEmail: userEmail || null,
        authToken: authToken || null,
      };
    } catch (error) {
      console.error("Error getting user context:", error);
      return null;
    }
  }

  /**
   * Generate a hash of user context for comparison
   */
  private getUserContextHash(userContext: any): string {
    if (!userContext) return "anonymous";
    
    const contextString = `${userContext.userId || ""}|${userContext.userEmail || ""}|${userContext.authToken || ""}`;
    return btoa(contextString); // Simple base64 encoding for comparison
  }

  /**
   * Store the current user context for future comparison
   */
  private storeUserContext(userContext: any) {
    if (typeof window === "undefined") return;

    try {
      const contextHash = this.getUserContextHash(userContext);
      localStorage.setItem(this.USER_CONTEXT_KEY, contextHash);
    } catch (error) {
      console.error("Error storing user context:", error);
    }
  }

  /**
   * Check if the user context has changed since last cache
   */
  private hasUserContextChanged(): boolean {
    if (typeof window === "undefined") return true;

    try {
      const currentUserContext = this.getCurrentUserContext();
      const currentHash = this.getUserContextHash(currentUserContext);
      const storedHash = localStorage.getItem(this.USER_CONTEXT_KEY);

      return currentHash !== storedHash;
    } catch (error) {
      console.error("Error checking user context change:", error);
      return true; // Assume changed on error
    }
  }

  /**
   * Cache a session ID with user context
   */
  cacheSession(sessionId: string): void {
    if (typeof window === "undefined") return;

    try {
      const userContext = this.getCurrentUserContext();
      const now = Date.now();

      const cacheData: CachedSessionData = {
        sessionId,
        userId: userContext?.userId || null,
        userEmail: userContext?.userEmail || null,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION,
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      this.storeUserContext(userContext);

      console.log("Session cached:", sessionId);
    } catch (error) {
      console.error("Error caching session:", error);
    }
  }

  /**
   * Get cached session if valid and user context hasn't changed
   */
  getCachedSession(): string | null {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        console.log("No cached session found");
        return null;
      }

      const parsedData: CachedSessionData = JSON.parse(cachedData);
      const now = Date.now();

      // Check if cache is expired
      if (now > parsedData.expiresAt) {
        console.log("Cached session expired");
        this.clearCache();
        return null;
      }

      // Check if user context has changed
      if (this.hasUserContextChanged()) {
        console.log("User context changed, invalidating cache");
        this.clearCache();
        return null;
      }

      // Validate that the cached session matches current user context
      const currentUserContext = this.getCurrentUserContext();
      const cachedUserId = parsedData.userId;
      const currentUserId = currentUserContext?.userId || null;

      if (cachedUserId !== currentUserId) {
        console.log("User ID mismatch, invalidating cache");
        this.clearCache();
        return null;
      }

      console.log("Using cached session:", parsedData.sessionId);
      return parsedData.sessionId;
    } catch (error) {
      console.error("Error getting cached session:", error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Clear the session cache
   */
  clearCache(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.USER_CONTEXT_KEY);
      console.log("Session cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Check if a cached session exists and is potentially valid (without full validation)
   */
  hasCachedSession(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) return false;

      const parsedData: CachedSessionData = JSON.parse(cachedData);
      const now = Date.now();

      // Only check basic expiration, not user context
      return now <= parsedData.expiresAt;
    } catch (error) {
      console.error("Error checking cached session:", error);
      return false;
    }
  }

  /**
   * Manually invalidate cache (useful for logout scenarios)
   */
  invalidateCache(): void {
    console.log("Manually invalidating session cache");
    this.clearCache();
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo(): any {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      const userContextHash = localStorage.getItem(this.USER_CONTEXT_KEY);
      const currentUserContext = this.getCurrentUserContext();

      return {
        hasCachedData: !!cachedData,
        cachedData: cachedData ? JSON.parse(cachedData) : null,
        storedUserContextHash: userContextHash,
        currentUserContextHash: this.getUserContextHash(currentUserContext),
        userContextChanged: this.hasUserContextChanged(),
        currentUserContext,
      };
    } catch (error) {
      console.error("Error getting cache info:", error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionCache = new SessionCacheService();