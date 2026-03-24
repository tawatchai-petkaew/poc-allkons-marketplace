// src/config/config.service.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      url: `postgres://${this.getValue('POSTGRES_USER')}:${this.getValue(
        'POSTGRES_PASSWORD',
      )}@${this.getValue('POSTGRES_HOST')}:${this.getValue(
        'POSTGRES_PORT',
      )}/${this.getValue('POSTGRES_DATABASE')}`,
      ssl:
        this.isProduction() ||
        this.getValue('IS_ENABLE_SSH_TUNNEL', false) === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
      entities: [`${__dirname}/../**/*.entity.{ts,js}`],

      migrationsTableName: 'migration',

      migrations: [
        this.getValue('NODE_ENV') === 'develop'
          ? `src/migration/*.{ts,js}`
          : `dist/migration/*.{ts,js}`,
      ],

      // Retry strategy
      retryAttempts: 10,
      retryDelay: 3000,

      // Connection pool - optimized for concurrent requests
      extra: {
        max: 50, // Increased to handle more concurrent requests
        min: 10, // Keep minimum connections ready
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000, // Increased timeout
        keepAlive: true,
      },
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
