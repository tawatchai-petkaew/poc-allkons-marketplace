import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.MODE !== 'DEV';
const isSSHTunnel = process.env.IS_ENABLE_SSH_TUNNEL === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`,
  ssl: isProduction || isSSHTunnel ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migration/*.ts'],
  migrationsTableName: 'migration',
});
