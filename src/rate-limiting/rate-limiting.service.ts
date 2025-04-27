import { Injectable, Logger } from '@nestjs/common';
import { TokenBucket } from './token-bucket';
import { RateLimitConfig, RateLimitRule } from './rate-limiting.config';
import { ConfigService } from '@nestjs/config';

interface BucketKey {
  ip: string;
  userId?: string;
  endpoint: string;
}

@Injectable()
export class RateLimitingService {
  private readonly logger = new Logger(RateLimitingService.name);
  private readonly buckets = new Map<string, TokenBucket>();
  private readonly blockedIPs = new Map<string, number>();
  private readonly config: RateLimitConfig;

  constructor(private configService: ConfigService) {
    const config = this.configService.get<RateLimitConfig>('rateLimit');
    if (!config) {
      throw new Error('Rate limit configuration is missing');
    }
    this.config = config;
  }

  /**
   * Generates a unique key for each token bucket using the IP, userId, and endpoint.
   * @param key - The bucket key components.
   */
  private getBucketKey(key: BucketKey): string {
    return `${key.ip}:${key.userId || 'anonymous'}:${key.endpoint}`;
  }

  /**
   * Determines the rate limit rule to apply based on the endpoint, authentication status, and premium flag.
   * @param endpoint - The endpoint being accessed.
   * @param isAuthenticated - Whether the user is authenticated.
   * @param isPremium - Whether the user has premium status.
   * @returns The matching RateLimitRule.
   */
  private getRule(endpoint: string, isAuthenticated: boolean, isPremium: boolean): RateLimitRule {
    // Check for endpoint-specific rules first.
    if (this.config.endpoints?.[endpoint]) {
      return this.config.endpoints[endpoint];
    }

    // Use rules based on authentication status.
    if (isAuthenticated) {
      return isPremium
        ? (this.config.authenticated.premium || this.config.authenticated.default)
        : this.config.authenticated.default;
    }

    // Fallback for unauthenticated users.
    return this.config.unauthenticated;
  }

  /**
   * Retrieves or creates a token bucket for a given key and rule.
   * @param key - The unique bucket key parts.
   * @param rule - The rate limit rule to apply.
   * @returns A TokenBucket instance.
   */
  private getBucket(key: BucketKey, rule: RateLimitRule): TokenBucket {
    const bucketKey = this.getBucketKey(key);
    let bucket = this.buckets.get(bucketKey);

    if (!bucket) {
      bucket = new TokenBucket(rule.points, rule.points / rule.duration);
      this.buckets.set(bucketKey, bucket);
    }

    return bucket;
  }

  /**
   * Checks if a specific IP is blocked from making requests.
   * @param ip - The IP address to check.
   * @returns A boolean indicating if the IP is blocked.
   */
  isBlocked(ip: string): boolean {
    const blockUntil = this.blockedIPs.get(ip);
    if (blockUntil && blockUntil > Date.now()) {
      return true;
    }
    // Cleanup expired block entries.
    if (blockUntil) {
      this.blockedIPs.delete(ip);
    }
    return false;
  }

  /**
   * Evaluates the current rate limit for a given request.
   * @param ip - The IP address of the requester.
   * @param endpoint - The endpoint being accessed.
   * @param userId - The user's ID if authenticated.
   * @param isPremium - Whether the user is a premium member.
   * @returns An object with allowed flag, remaining tokens, reset time, and the limit.
   */
  async checkRateLimit(
    ip: string,
    endpoint: string,
    userId?: string,
    isPremium: boolean = false,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; limit: number }> {
    // Immediately block the IP if it's already blocked.
    if (this.isBlocked(ip)) {
      const blockUntil = this.blockedIPs.get(ip);
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil ? blockUntil - Date.now() : 0,
        limit: 0,
      };
    }

    const isAuthenticated = !!userId;
    const rule = this.getRule(endpoint, isAuthenticated, isPremium);
    const bucket = this.getBucket({ ip, userId, endpoint }, rule);

    // Attempt to consume a token for the request.
    const allowed = bucket.consume(1);
    const remaining = bucket.getRemainingTokens();
    const resetTime = bucket.getResetTime();

    // If rate limit exceeded and block duration is set, block the IP.
    if (!allowed && rule.blockDuration) {
      const blockUntil = Date.now() + rule.blockDuration * 1000;
      this.blockedIPs.set(ip, blockUntil);
      this.logger.warn(`IP ${ip} has been blocked until ${new Date(blockUntil).toISOString()} due to rate limit.`);
    }

    return { allowed, remaining, resetTime, limit: rule.points };
  }

  /**
   * Periodically cleans up expired blocked IPs and optionally inactive token buckets.
   */
  cleanup(): void {
    const now = Date.now();
    
    // Cleanup expired blocked IPs.
    for (const [ip, blockUntil] of this.blockedIPs.entries()) {
      if (blockUntil <= now) {
        this.blockedIPs.delete(ip);
      }
    }

    // Bucket cleanup can be implemented here if tokens are not used for an extended period.
  }
}
