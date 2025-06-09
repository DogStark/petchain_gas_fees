import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Use X-Forwarded-For header if available (behind proxy)
    return req.headers['x-forwarded-for'] || req.ip;
  }
} 