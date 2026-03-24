import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SentryInterceptor } from './sentry/sentry.interceptor';
import { HealthCheck } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';

@UseInterceptors(SentryInterceptor)
@Controller()
@ApiTags('Default')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/i18n')
  async getHello(@I18n() i18n: I18nContext) {
    return await i18n.t('errors.HELLO');
  }

  @Get('/health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('/health-check')
  @HealthCheck()
  check() {
    return this.appService.getHealthCheck();
  }

  @Get()
  getRoot() {
    return 'Hello';
  }
}
