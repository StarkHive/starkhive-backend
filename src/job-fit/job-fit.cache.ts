import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JobFitCache {
    constructor(private readonly redis: RedisService) {}

    private getKey(userId: string, jobId: string): string {
        return `jobfit:${userId}:${jobId}`;
    }

    async get(userId: string, jobId: string): Promise<number | null> {
        const score = await this.redis.get(this.getKey(userId, jobId));
        return score ? Number(score) : null;
    }

    async set(userId: string, jobId: string, score: number): Promise<void> {
        // 1 hour expiry
        await this.redis.set(this.getKey(userId, jobId), score.toString(), 'EX', 60 * 60);
    }
}
