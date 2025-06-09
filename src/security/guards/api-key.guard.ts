import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../security.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly securityService: SecurityService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    try {
      await this.securityService.validateApiKey(apiKey);
      request.user = {
        apiKey,
        permissions: await this.securityService.getApiKeyPermissions(apiKey),
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private extractApiKeyFromHeader(request: any): string {
    const authHeader = request.headers['x-api-key'];
    if (!authHeader) {
      throw new UnauthorizedException('API key is missing');
    }
    return authHeader;
  }
} 