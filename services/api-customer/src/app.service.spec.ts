import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { getConnectionToken } from '@nestjs/typeorm';

describe('AppService', () => {
  let service: AppService;
  let healthCheckService: any;
  let typeOrmHealthIndicator: any;
  let connection: any;

  beforeEach(async () => {
    healthCheckService = {
      check: jest.fn(),
    };
    typeOrmHealthIndicator = {
      pingCheck: jest.fn(),
    };
    connection = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicator },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health info', () => {
      const result = service.getHealth();
      expect(result.message).toBe('OK');
      expect(result.version).toBeDefined();
    });
  });

  describe('getHealthCheck', () => {
    it('should call health check', async () => {
      healthCheckService.check.mockImplementation((fns) => {
        // Execute the function passed to check to trigger pingCheck
        fns.forEach((fn) => fn());
        return Promise.resolve({ status: 'ok' });
      });
      typeOrmHealthIndicator.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      await service.getHealthCheck();
      expect(healthCheckService.check).toHaveBeenCalled();
      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith(
        'database',
        { connection },
      );
    });
  });
});
