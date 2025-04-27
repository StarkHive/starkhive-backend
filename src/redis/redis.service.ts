import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    async onModuleInit() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        await this.client.connect();
    }

    async onModuleDestroy() {
        if (this.client) await this.client.disconnect();
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, expireMode?: string, duration?: number): Promise<void> {
        if (expireMode && duration) {
            await this.client.set(key, value, { EX: duration });
        } else {
            await this.client.set(key, value);
        }
    }
}
