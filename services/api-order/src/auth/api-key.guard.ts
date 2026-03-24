// api-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {

  async canActivate(context: ExecutionContext) {
    const apiKey = this.extractApiKey(context);
    if (!apiKey) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    return true;
  }

  private extractApiKey(context: ExecutionContext): string | null {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['app-id'] || null;
    return apiKey;
  }
}

@Injectable()
export class PublicApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const appId = this.extractApiKey(context);
    if (!appId) {
      throw new UnauthorizedException('API key is required');
    }

    const appIdSeller = this.configService.get<string>('APP_ID_SELLER');
    const appIdBuyer = this.configService.get<string>('APP_ID_BUYER');
    const appIdMarketplace =
      this.configService.get<string>('APP_ID_MARKETPLACE');

    if (!appIdBuyer || !appIdSeller || !appIdMarketplace) {
      throw new UnauthorizedException('Server configuration error');
    }

    if (
      appId === appIdSeller ||
      appId === appIdBuyer ||
      appId === appIdMarketplace
    ) {
      const request = context.switchToHttp().getRequest();
      request.isAppIdAuthenticated = true;
      return true;
    }

    throw new UnauthorizedException('Invalid API key');
  }

  private extractApiKey(context: ExecutionContext): string | null {
    const request = context.switchToHttp().getRequest();
    const appId = request.headers['app-id'] || null;
    return appId;
  }
}
