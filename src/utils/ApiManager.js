/**
 * Global API Manager with Rate Limiting and Request Queue
 * Prevents backend crashes by controlling API request flow
 */

class ApiManager {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
    this.activeRequests = new Map(); // Track active requests by key
    this.requestCache = new Map(); // Cache responses
    this.CACHE_DURATION = 30000; // 30 seconds cache
  }

  /**
   * Add a request to the queue with cancellation support
   * @param {string} key - Unique key for this request
   * @param {Function} apiCall - Function that returns a Promise
   * @param {number} priority - Lower number = higher priority (default: 10)
   * @returns {Promise} - Resolves with API response
   */
  async enqueueRequest(key, apiCall, priority = 10) {
    console.log(`[API Manager] Enqueuing request: ${key}`);

    // Cancel any existing request with the same key
    this.cancelRequest(key);

    // Check cache first
    const cached = this.getCachedResponse(key);
    if (cached) {
      console.log(`[API Manager] Using cached response for: ${key}`);
      return cached;
    }

    return new Promise((resolve, reject) => {
      const request = {
        key,
        apiCall,
        priority,
        resolve,
        reject,
        timestamp: Date.now(),
        cancelled: false
      };

      // Add to queue and sort by priority
      this.requestQueue.push(request);
      this.requestQueue.sort((a, b) => a.priority - b.priority);

      // Track active request
      this.activeRequests.set(key, request);

      // Start processing if not already running
      this.processQueue();
    });
  }

  /**
   * Cancel a specific request by key
   */
  cancelRequest(key) {
    // Mark as cancelled in active requests
    const activeRequest = this.activeRequests.get(key);
    if (activeRequest) {
      console.log(`[API Manager] Cancelling request: ${key}`);
      activeRequest.cancelled = true;
      this.activeRequests.delete(key);
    }

    // Remove from queue
    this.requestQueue = this.requestQueue.filter(req => {
      if (req.key === key) {
        req.cancelled = true;
        req.reject(new Error('Request cancelled'));
        return false;
      }
      return true;
    });
  }

  /**
   * Cancel ALL pending requests (use when switching wallets)
   */
  cancelAllRequests() {
    console.log(`[API Manager] Cancelling ALL requests (${this.requestQueue.length} pending)`);
    
    // Cancel all requests in queue
    this.requestQueue.forEach(req => {
      req.cancelled = true;
      req.reject(new Error('All requests cancelled'));
    });
    
    this.requestQueue = [];
    this.activeRequests.clear();
  }

  /**
   * Process the request queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      // Enforce rate limiting
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`[API Manager] Rate limiting: waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }

      // Get next request
      const request = this.requestQueue.shift();
      
      if (!request || request.cancelled) {
        continue;
      }

      try {
        console.log(`[API Manager] Processing request: ${request.key}`);
        this.lastRequestTime = Date.now();

        // Make the API call
        const response = await request.apiCall();
        
        // Cache the response
        this.cacheResponse(request.key, response);
        
        // Resolve if not cancelled
        if (!request.cancelled) {
          request.resolve(response);
        }
        
      } catch (error) {
        console.error(`[API Manager] Request failed: ${request.key}`, error);
        
        // Check for rate limiting error
        if (error.message && error.message.includes('Too many requests')) {
          console.log(`[API Manager] Hit rate limit, backing off for 5 seconds`);
          await this.sleep(5000);
          
          // Try to use cached response if available
          const cached = this.getCachedResponse(request.key);
          if (cached && !request.cancelled) {
            console.log(`[API Manager] Using cached response due to rate limit: ${request.key}`);
            request.resolve(cached);
          } else if (!request.cancelled) {
            request.reject(error);
          }
        } else if (!request.cancelled) {
          request.reject(error);
        }
      } finally {
        // Clean up
        this.activeRequests.delete(request.key);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Cache API response
   */
  cacheResponse(key, response) {
    this.requestCache.set(key, {
      data: response,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    this.cleanCache();
  }

  /**
   * Get cached response if valid
   */
  getCachedResponse(key) {
    const cached = this.requestCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Clean expired cache entries
   */
  cleanCache() {
    const now = Date.now();
    for (const [key, cached] of this.requestCache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status for debugging
   */
  getStatus() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      activeRequests: this.activeRequests.size,
      cachedResponses: this.requestCache.size,
      lastRequestTime: this.lastRequestTime
    };
  }
}

// Create global singleton instance
export const apiManager = new ApiManager();

// Helper function for easy usage
export const makeApiRequest = (key, apiCall, priority = 10) => {
  return apiManager.enqueueRequest(key, apiCall, priority);
};

// Helper to cancel requests for a specific user/wallet
export const cancelUserRequests = (userAddress) => {
  if (userAddress) {
    // Cancel all requests related to this user
    ['deposits', 'referrals', 'trophies', 'transactions', 'registration'].forEach(type => {
      apiManager.cancelRequest(`${type}_${userAddress}`);
    });
  }
};

// Helper to cancel all requests (wallet switch)
export const cancelAllApiRequests = () => {
  apiManager.cancelAllRequests();
};

export default apiManager;
