import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheck } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

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
  getApp() {
    return 'Amazing Allkons Marketplace Product API';
  }
}
