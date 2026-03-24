import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

/**
 * Guard for authenticating MASTER_SKU webhook requests
 * Validates x-api-key header against environment variable
 */
@Injectable()
export class MasterSkuApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(MasterSkuApiKeyGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      this.logger.warn('MASTER_SKU webhook attempt without API key');
      throw new UnauthorizedException('API key required');
    }

    const validKey = process.env.MASTER_SKU_WEBHOOK_API_KEY;

    if (!validKey) {
      this.logger.error(
        'MASTER_SKU_WEBHOOK_API_KEY not configured in environment',
      );
      throw new UnauthorizedException('Service configuration error');
    }

    if (apiKey !== validKey) {
      this.logger.warn(
        `MASTER_SKU webhook attempt with invalid API key from IP: ${request.ip}`,
      );
      throw new UnauthorizedException('Invalid API key');
    }

    // Mark request as authenticated by MASTER_SKU
    request.isMasterSkuAuthenticated = true;

    this.logger.log('MASTER_SKU webhook authenticated successfully');
    return true;
  }
}
