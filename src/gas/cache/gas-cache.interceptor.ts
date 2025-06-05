import { Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class GasCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    return `gas_${request.url}`;
  }
}