import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleOptions = {
  ttl: 30 * 1000, // 30 seconds
  max: 100, // Maximum number of items in cache
  store: process.env.REDIS_URL 
    ? redisStore({ url: process.env.REDIS_URL })
    : memoryStore(),
};