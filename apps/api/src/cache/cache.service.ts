import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private available = false;

  async onModuleInit() {
    try {
      const url = process.env.REDIS_URL;
      this.client = url
        ? new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true })
        : new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            maxRetriesPerRequest: 1,
            lazyConnect: true,
          });

      await this.client.connect();
      this.available = true;
    } catch {
      this.available = false;
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  async ping(): Promise<boolean> {
    if (!this.client || !this.available) return false;
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.available) return null;
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client || !this.available) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Cache miss on write — non-fatal
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.available) return;
    try {
      await this.client.del(key);
    } catch {
      // Non-fatal
    }
  }
}
