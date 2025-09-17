/**
 * Request Deduplication System
 * Prevents duplicate API calls, especially useful in React Strict Mode
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5000; // 5 seconds
  private readonly CLEANUP_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Periodic cleanup of expired entries
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Generate a unique key for the request
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${url}:${typeof body === 'string' ? body : JSON.stringify(body)}`;
  }

  /**
   * Check if we should deduplicate this request
   */
  private shouldDeduplicate(method: string): boolean {
    // Only deduplicate GET requests and safe operations
    return method === 'GET' || method === 'HEAD';
  }

  /**
   * Get cached response if available and fresh
   */
  private getCachedResponse(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store response in cache
   */
  private setCachedResponse(key: string, data: any): void {
    // Deep clone the data to prevent mutations
    let clonedData: any;
    try {
      // Use structuredClone if available (modern browsers)
      clonedData = typeof structuredClone !== 'undefined' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
    } catch (error) {
      // Fallback for non-serializable data
      clonedData = data;
    }

    this.requestCache.set(key, {
      data: clonedData,
      timestamp: Date.now()
    });
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean up pending requests older than 30 seconds (probably failed)
    const pendingKeysToDelete: string[] = [];
    this.pendingRequests.forEach((request, key) => {
      if (now - request.timestamp > 30000) {
        pendingKeysToDelete.push(key);
      }
    });
    pendingKeysToDelete.forEach(key => this.pendingRequests.delete(key));

    // Clean up expired cache entries
    const cacheKeysToDelete: string[] = [];
    this.requestCache.forEach((cached, key) => {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        cacheKeysToDelete.push(key);
      }
    });
    cacheKeysToDelete.forEach(key => this.requestCache.delete(key));
  }

  /**
   * Execute request with deduplication
   */
  async executeRequest<T>(
    url: string,
    options: RequestInit = {},
    fetcher: (url: string, options: RequestInit) => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(url, options);
    const method = options.method || 'GET';

    // For non-GET requests, always execute (but still track to prevent rapid duplicates)
    if (!this.shouldDeduplicate(method)) {
      // Check for rapid duplicate POST/PUT/DELETE requests
      const pending = this.pendingRequests.get(key);
      if (pending && (Date.now() - pending.timestamp) < 1000) {
        console.warn(`[RequestDeduplicator] Preventing rapid duplicate ${method} request to ${url}`);
        return pending.promise;
      }

      const promise = fetcher(url, options);
      this.pendingRequests.set(key, { promise, timestamp: Date.now() });

      try {
        const result = await promise;
        this.pendingRequests.delete(key);
        return result;
      } catch (error) {
        this.pendingRequests.delete(key);
        throw error;
      }
    }

    // For GET requests, check cache first
    const cached = this.getCachedResponse(key);
    if (cached) {
      console.log(`[RequestDeduplicator] Returning cached response for ${url}`);
      return cached;
    }

    // Check if there's already a pending request for this
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`[RequestDeduplicator] Deduplicating request to ${url}`);
      return pending.promise;
    }

    // Execute new request
    const promise = fetcher(url, options);
    this.pendingRequests.set(key, { promise, timestamp: Date.now() });

    try {
      const result = await promise;
      this.pendingRequests.delete(key);

      // Cache GET request results
      if (method === 'GET') {
        this.setCachedResponse(key, result);
      }

      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  /**
   * Clear all cached requests (useful for forced refresh)
   */
  clearCache(): void {
    this.requestCache.clear();
    this.pendingRequests.clear();
    console.log('[RequestDeduplicator] Cache cleared');
  }

  /**
   * Get statistics about current cache state
   */
  getStats(): {
    pendingRequests: number;
    cachedResponses: number;
    oldestCache: number | null;
  } {
    let oldestCache: number | null = null;
    const now = Date.now();

    this.requestCache.forEach((cached) => {
      const age = now - cached.timestamp;
      if (oldestCache === null || age > oldestCache) {
        oldestCache = age;
      }
    });

    return {
      pendingRequests: this.pendingRequests.size,
      cachedResponses: this.requestCache.size,
      oldestCache,
    };
  }
}

// Global instance
export const requestDeduplicator = new RequestDeduplicator();

// Helper function to wrap fetch with deduplication
export async function deduplicatedFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return requestDeduplicator.executeRequest(url, options, fetch);
}

// Development helper to expose cache control
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).requestCache = {
    clear: () => requestDeduplicator.clearCache(),
    stats: () => requestDeduplicator.getStats(),
  };
}