import { Injectable } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';

const { version } = require('../package.json');

@Injectable()
export class AppService {
  constructor(
    private healthCheckService: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection()
    private defaultConnection: Connection,
  ) {}

  getHealth() {
    const currentDate = new Date();

    const healthCheck = {
      node_env: process.env.NODE_ENV,
      uptime: process.uptime(),
      tz: process.env.TZ,
      tzOffSet: currentDate.getTimezoneOffset(),
      message: 'OK',
      timestamp: new Date(
        currentDate.getTime() +
          currentDate.getTimezoneOffset() * 60 * 1000 * -1,
      ).toISOString(),
      time: new Date(),
      version,
      commit: process.env.GIT_COMMIT,
    };
    return healthCheck;
  }

  async getHealthCheck() {
    return this.healthCheckService.check([
      () =>
        this.db.pingCheck('database', { connection: this.defaultConnection }),
    ]);
  }
}
