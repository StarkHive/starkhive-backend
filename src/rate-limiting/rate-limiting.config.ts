export interface RateLimitRule {
  points: number;        // Number of requests
  duration: number;      // Time window in seconds
  blockDuration?: number; // Duration to block if limit exceeded (seconds)
}

export interface RateLimitConfig {
  global: RateLimitRule;
  authenticated: {
    default: RateLimitRule;
    premium?: RateLimitRule;
  };
  unauthenticated: RateLimitRule;
  endpoints?: {
    [key: string]: RateLimitRule;
  };
}

const rateLimitConfig: RateLimitConfig = {
  global: {
    points: 1000,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 15, // 15 minutes
  },
  authenticated: {
    default: {
      points: 100,
      duration: 60, // 1 minute
      blockDuration: 60 * 5, // 5 minutes
    },
    premium: {
      points: 300,
      duration: 60, // 1 minute
      blockDuration: 60 * 5, // 5 minutes
    },
  },
  unauthenticated: {
    points: 30,
    duration: 60, // 1 minute
    blockDuration: 60 * 10, // 10 minutes
  },
  endpoints: {
    '/api/freelancer-profiles/search': {
      points: 20,
      duration: 60, // 1 minute
      blockDuration: 60 * 5, // 5 minutes
    },
    '/api/auth/login': {
      points: 5,
      duration: 60, // 1 minute
      blockDuration: 60 * 15, // 15 minutes
    },
  },
};

export default rateLimitConfig;
