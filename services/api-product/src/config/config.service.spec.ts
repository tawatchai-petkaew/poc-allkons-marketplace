/*
  Tests for ConfigService via the exported configService instance.
  We use jest.resetModules and manipulate process.env to cover all branches:
  - ensureValues throws when required envs are missing (module import-time)
  - isProduction false when MODE=DEV, true when MODE=PROD, true when MODE missing
  - getTypeOrmConfig ssl false/true, migrations src/dist depending on NODE_ENV
*/

describe('config.service (module import behavior)', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  it('throws on import when required envs are missing', () => {
    // Ensure required keys are absent
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_DATABASE;

    // Prevent dotenv from repopulating env from .env files during this import
    jest.doMock('dotenv', () => ({ config: jest.fn() }));

    expect(() => {
      jest.isolateModules(() => {
         
        require('./config.service');
      });
    }).toThrow(/config error - missing env\.POSTGRES_HOST/);
  });

  it('DEV mode: ssl=false, migrations from src, isProduction=false', () => {
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PORT = '5432';
    process.env.POSTGRES_USER = 'user';
    process.env.POSTGRES_PASSWORD = 'pass';
    process.env.POSTGRES_DATABASE = 'db';
    process.env.PORT = '3000';
    process.env.MODE = 'DEV';
    process.env.IS_ENABLE_SSH_TUNNEL = 'false';
    process.env.NODE_ENV = 'develop';

     
    const mod = require('./config.service');
    const { configService } = mod as { configService: any };

    expect(configService.isProduction()).toBe(false);

    const cfg = configService.getTypeOrmConfig();
    expect(cfg.type).toBe('postgres');
    expect(cfg.url).toBe('postgres://user:pass@localhost:5432/db');
    expect(cfg.ssl).toBe(false);
    expect(Array.isArray(cfg.entities)).toBe(true);
    expect(cfg.entities[0]).toEqual(expect.stringContaining('/**/*.entity.'));
    expect(cfg.migrationsTableName).toBe('migration');
    expect(cfg.migrations).toEqual(['src/migration/*.{ts,js}']);
    expect(cfg.retryAttempts).toBe(10);
    expect(cfg.retryDelay).toBe(3000);
    expect(cfg.extra).toMatchObject({
      max: 50,
      min: 10,
      keepAlive: true,
    });
  });

  it('PROD mode with SSH tunnel: ssl object, migrations from dist, isProduction=true', () => {
    process.env.POSTGRES_HOST = 'prod-host';
    process.env.POSTGRES_PORT = '5432';
    process.env.POSTGRES_USER = 'puser';
    process.env.POSTGRES_PASSWORD = 'ppass';
    process.env.POSTGRES_DATABASE = 'pdb';
    process.env.PORT = '8080';
    process.env.MODE = 'PROD';
    process.env.IS_ENABLE_SSH_TUNNEL = 'true';
    process.env.NODE_ENV = 'production';

     
    const mod = require('./config.service');
    const { configService } = mod as { configService: any };

    expect(configService.isProduction()).toBe(true);

    const cfg = configService.getTypeOrmConfig();
    expect(cfg.ssl).toEqual({ rejectUnauthorized: false });
    expect(cfg.migrations).toEqual(['dist/migration/*.{ts,js}']);
    expect(cfg.url).toBe('postgres://puser:ppass@prod-host:5432/pdb');
  });

  it('isProduction returns true when MODE is missing', () => {
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PORT = '5432';
    process.env.POSTGRES_USER = 'user';
    process.env.POSTGRES_PASSWORD = 'pass';
    process.env.POSTGRES_DATABASE = 'db';
    delete process.env.MODE; // simulate missing MODE
    process.env.NODE_ENV = 'develop';

     
    const mod = require('./config.service');
    const { configService } = mod as { configService: any };

    expect(configService.isProduction()).toBe(true);
  });
});
