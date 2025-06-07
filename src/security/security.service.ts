import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class SecurityService {
  private readonly apiKeys: Map<string, { userId: string; permissions: string[] }>;

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.apiKeys = new Map();
    this.initializeApiKeys();
  }

  private async initializeApiKeys() {
    // Load API keys from environment or database
    const apiKeys = this.configService.get<string>('API_KEYS');
    if (apiKeys) {
      const keys = JSON.parse(apiKeys);
      Object.entries(keys).forEach(([key, value]: [string, any]) => {
        this.apiKeys.set(key, {
          userId: value.userId,
          permissions: value.permissions || [],
        });
      });
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check rate limit in Redis
    const key = `rate_limit:${keyData.userId}`;
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, 60); // 1 minute window
    }

    const limit = this.configService.get<number>('RATE_LIMIT_PER_MINUTE', 100);
    if (current > limit) {
      throw new UnauthorizedException('Rate limit exceeded');
    }

    return true;
  }

  async getApiKeyPermissions(apiKey: string): Promise<string[]> {
    const keyData = this.apiKeys.get(apiKey);
    return keyData?.permissions || [];
  }

  async createApiKey(userId: string, permissions: string[] = []): Promise<string> {
    const apiKey = this.generateApiKey();
    this.apiKeys.set(apiKey, { userId, permissions });
    return apiKey;
  }

  async revokeApiKey(apiKey: string): Promise<void> {
    this.apiKeys.delete(apiKey);
  }

  private generateApiKey(): string {
    return `pk_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  }

  async getRateLimitInfo(userId: string): Promise<{ current: number; limit: number }> {
    const key = `rate_limit:${userId}`;
    const current = parseInt(await this.redis.get(key) || '0');
    const limit = this.configService.get<number>('RATE_LIMIT_PER_MINUTE', 100);
    return { current, limit };
  }
} 