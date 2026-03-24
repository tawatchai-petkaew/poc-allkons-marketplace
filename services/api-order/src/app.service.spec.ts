import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Connection } from 'typeorm';
import { getConnectionToken } from '@nestjs/typeorm';

describe('AppService', () => {
  let service: AppService;
  let healthCheckService: HealthCheckService;
  let db: TypeOrmHealthIndicator;
  let connection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    db = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
    connection = module.get<Connection>(getConnectionToken());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('node_env');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('message', 'OK');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
    });
  });

  describe('getHealthCheck', () => {
    it('should call healthCheckService.check', async () => {
      const expectedResult = { status: 'ok', info: {}, error: {}, details: {} };
      (healthCheckService.check as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.getHealthCheck();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});
