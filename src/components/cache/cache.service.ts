import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { isJSON } from 'class-validator';

@Injectable()
export class CacheService implements OnModuleDestroy {
  public readonly redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  });

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /** Caches a value
   * @param key - The cache key
   * @param value - A object or an array
   * @param ttl - The expiration time in seconds
   */
  async set(
    key: string,
    value: Record<string, any> | Record<string, any>[],
    ttl?: number,
  ) {
    const data = JSON.stringify(value);

    if (ttl) {
      await this.redis.set(key, data, 'EX', ttl);
    } else {
      await this.redis.set(key, data);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);

    if (!data) return null;

    if (isJSON(data)) return JSON.parse(data) as T;

    return data as T;
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /** Deletes every key matching a glob pattern, using SCAN so Redis isn't blocked. */
  async delByPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({ match: pattern, count: 100 });

    for await (const keys of stream) {
      if ((keys as string[]).length) {
        await this.redis.del(...(keys as string[]));
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}
