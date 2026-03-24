import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { getConnectionToken } from '@nestjs/typeorm';

describe('AppService', () => {
  let service: AppService;
  const mockHealthCheckService = {
    check: jest.fn(),
  } as unknown as HealthCheckService;
  const mockDbIndicator = {
    pingCheck: jest.fn(),
  } as unknown as TypeOrmHealthIndicator;
  const mockConnection: any = { id: 'connection' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockDbIndicator },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get<AppService>(AppService);

    // env baselines for getHealth
    process.env.NODE_ENV = 'test';
    process.env.TZ = 'UTC';
    process.env.GIT_COMMIT = 'abc123';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('returns health object with expected fields', () => {
      const res = service.getHealth();
      expect(res).toHaveProperty('node_env', process.env.NODE_ENV);
      expect(typeof res.uptime).toBe('number');
      expect(res).toHaveProperty('tz', process.env.TZ);
      expect(res).toHaveProperty('tzOffSet', new Date().getTimezoneOffset());
      expect(res).toHaveProperty('message', 'OK');
      // timestamp ISO
      expect(() => new Date(res.timestamp)).not.toThrow();
      expect(res.timestamp).toEqual(new Date(res.timestamp).toISOString());
      // time is Date-like
      expect(res.time).toBeInstanceOf(Date);
      expect(typeof res.version).toBe('string');
      expect(res.commit).toBe('abc123');
    });
  });

  describe('getHealthCheck', () => {
    it('pings database via indicator and returns check result', async () => {
      (mockDbIndicator.pingCheck as any).mockResolvedValue({
        database: { status: 'up' },
      });
      (mockHealthCheckService.check as any).mockImplementation(
        async (indicators: any[]) => {
          const results = await Promise.all(indicators.map((fn) => fn()));
          return { status: 'ok', info: results };
        },
      );

      const res = await service.getHealthCheck();
      expect(mockDbIndicator.pingCheck as any).toHaveBeenCalledWith(
        'database',
        { connection: mockConnection },
      );
      expect(res).toHaveProperty('status', 'ok');
    });

    it('propagates errors from health check', async () => {
      (mockHealthCheckService.check as any).mockRejectedValue(
        new Error('fail'),
      );
      await expect(service.getHealthCheck()).rejects.toThrow('fail');
    });
  });
});
