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

  private getBucketKey(key: BucketKey): string {
    return `${key.ip}:${key.userId || 'anonymous'}:${key.endpoint}`;
  }

  private getRule(endpoint: string, isAuthenticated: boolean, isPremium: boolean): RateLimitRule {
    // Check endpoint-specific rules
    if (this.config.endpoints?.[endpoint]) {
      return this.config.endpoints[endpoint];
    }

    // Check authentication status rules
    if (isAuthenticated) {
      return isPremium 
        ? this.config.authenticated.premium || this.config.authenticated.default
        : this.config.authenticated.default;
    }

    return this.config.unauthenticated;
  }

  private getBucket(key: BucketKey, rule: RateLimitRule): TokenBucket {
    const bucketKey = this.getBucketKey(key);
    let bucket = this.buckets.get(bucketKey);

    if (!bucket) {
      bucket = new TokenBucket(rule.points, rule.points / rule.duration);
      this.buckets.set(bucketKey, bucket);
    }

    return bucket;
  }

  isBlocked(ip: string): boolean {
    const blockUntil = this.blockedIPs.get(ip);
    if (blockUntil && blockUntil > Date.now()) {
      return true;
    }
    if (blockUntil) {
      this.blockedIPs.delete(ip);
    }
    return false;
  }

  async checkRateLimit(
    ip: string,
    endpoint: string,
    userId?: string,
    isPremium: boolean = false,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    // Check if IP is blocked
    if (this.isBlocked(ip)) {
      const blockUntil = this.blockedIPs.get(ip);
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil ? blockUntil - Date.now() : 0,
      };
    }

    const isAuthenticated = !!userId;
    const rule = this.getRule(endpoint, isAuthenticated, isPremium);
    const bucket = this.getBucket({ ip, userId, endpoint }, rule);

    const allowed = bucket.consume(1);
    const remaining = bucket.getRemainingTokens();
    const resetTime = bucket.getResetTime();

    // If rate limit exceeded and block duration specified, block the IP
    if (!allowed && rule.blockDuration) {
      const blockUntil = Date.now() + rule.blockDuration * 1000;
      this.blockedIPs.set(ip, blockUntil);
      this.logger.warn(`IP ${ip} blocked until ${new Date(blockUntil)}`);
    }

    return { allowed, remaining, resetTime };
  }

  // Method to handle cleanup of expired buckets (can be called periodically)
  cleanup(): void {
    const now = Date.now();
    
    // Cleanup blocked IPs
    for (const [ip, blockUntil] of this.blockedIPs.entries()) {
      if (blockUntil <= now) {
        this.blockedIPs.delete(ip);
      }
    }

    // In a production environment, you might want to implement bucket cleanup
    // based on last access time to prevent memory leaks
  }
}
