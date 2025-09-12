interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now - entry.windowStart > this.config.windowMs) {
      // New window or expired entry
      this.store.set(identifier, {
        count: 1,
        windowStart: now
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return this.config.maxRequests;
    
    const now = Date.now();
    if (now - entry.windowStart > this.config.windowMs) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - entry.count);
  }

  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return 0;
    
    return entry.windowStart + this.config.windowMs;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart > this.config.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

// Rate limiters for different endpoints
export const uploadRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10 // 10 uploads per 15 minutes
});

export const chatRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 20 // 20 chat requests per minute
});

export function getClientIdentifier(request: Request): string {
  // In production, you might want to use actual IP addresses
  // For now, using a combination of User-Agent and a session-like identifier
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const forwarded = request.headers.get('x-forwarded-for') || 'localhost';
  
  return `${forwarded}-${userAgent.slice(0, 50)}`;
}

export function createRateLimitResponse(resetTime: number) {
  return new Response(JSON.stringify({ 
    error: 'Too many requests. Please try again later.' 
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Reset': resetTime.toString(),
      'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
    }
  });
}