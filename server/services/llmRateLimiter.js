// Rate limiter for LLM API calls to protect against abuse and control costs
// Uses simple in-memory rate limiting (for production, consider Redis)

// Rate limit configuration
const RATE_LIMITS = {
  // Per-minute limits (to prevent burst abuse)
  perMinute: parseInt(process.env.LLM_RATE_LIMIT_PER_MINUTE || '30'), // 30 requests per minute default
  
  // Per-hour limits (to control daily costs)
  perHour: parseInt(process.env.LLM_RATE_LIMIT_PER_HOUR || '500'), // 500 requests per hour default
  
  // Per-day limits (safety net)
  perDay: parseInt(process.env.LLM_RATE_LIMIT_PER_DAY || '10000') // 10k requests per day default
};

// Track requests (in production, use Redis for distributed systems)
const requestHistory = {
  minute: [],
  hour: [],
  day: []
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  requestHistory.minute = requestHistory.minute.filter(time => now - time < 60000);
  requestHistory.hour = requestHistory.hour.filter(time => now - time < 3600000);
  requestHistory.day = requestHistory.day.filter(time => now - time < 86400000);
}, 60000); // Clean every minute

/**
 * Check if a request should be rate limited
 * @returns {Object} { allowed: boolean, reason?: string, retryAfter?: number }
 */
function checkRateLimit() {
  const now = Date.now();
  
  // Check per-minute limit
  const recentMinute = requestHistory.minute.filter(time => now - time < 60000);
  if (recentMinute.length >= RATE_LIMITS.perMinute) {
    const oldestInMinute = Math.min(...recentMinute);
    const retryAfter = Math.ceil((60000 - (now - oldestInMinute)) / 1000);
    return {
      allowed: false,
      reason: 'Rate limit exceeded: too many requests per minute',
      retryAfter
    };
  }
  
  // Check per-hour limit
  const recentHour = requestHistory.hour.filter(time => now - time < 3600000);
  if (recentHour.length >= RATE_LIMITS.perHour) {
    const oldestInHour = Math.min(...recentHour);
    const retryAfter = Math.ceil((3600000 - (now - oldestInHour)) / 1000);
    return {
      allowed: false,
      reason: 'Rate limit exceeded: too many requests per hour',
      retryAfter
    };
  }
  
  // Check per-day limit
  const recentDay = requestHistory.day.filter(time => now - time < 86400000);
  if (recentDay.length >= RATE_LIMITS.perDay) {
    return {
      allowed: false,
      reason: 'Rate limit exceeded: daily limit reached',
      retryAfter: 3600 // Suggest retry in 1 hour
    };
  }
  
  // Record this request
  requestHistory.minute.push(now);
  requestHistory.hour.push(now);
  requestHistory.day.push(now);
  
  return { allowed: true };
}

/**
 * Get current rate limit stats
 * @returns {Object} Current usage stats
 */
function getRateLimitStats() {
  const now = Date.now();
  return {
    minute: {
      used: requestHistory.minute.filter(time => now - time < 60000).length,
      limit: RATE_LIMITS.perMinute
    },
    hour: {
      used: requestHistory.hour.filter(time => now - time < 3600000).length,
      limit: RATE_LIMITS.perHour
    },
    day: {
      used: requestHistory.day.filter(time => now - time < 86400000).length,
      limit: RATE_LIMITS.perDay
    }
  };
}

module.exports = {
  checkRateLimit,
  getRateLimitStats,
  RATE_LIMITS
};

