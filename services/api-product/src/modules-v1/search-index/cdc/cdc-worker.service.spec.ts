import { Test, TestingModule } from '@nestjs/testing';
import { CdcWorkerService } from './cdc-worker.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChangesQueue } from '../entities';
import { ConfigService } from '@nestjs/config';
import { AggregatorService } from './aggregator.service';

// Mock dependencies
const mockChangesQueueRepository = {
  find: jest.fn().mockResolvedValue([]),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAggregatorService = {
  aggregate: jest.fn().mockResolvedValue([]),
};

const mockConfigService = {
  get: jest.fn((key, defaultValue) => defaultValue),
};

describe('CdcWorkerService', () => {
  let service: CdcWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CdcWorkerService,
        {
          provide: getRepositoryToken(ChangesQueue),
          useValue: mockChangesQueueRepository,
        },
        {
          provide: AggregatorService,
          useValue: mockAggregatorService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CdcWorkerService>(CdcWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log resource usage during pollChanges', async () => {
    // Spy on Logger.prototype.log (or the service's logger instance if accessible)
    // Accessing private logger property is tricky in TS without casting,
    // but the service uses `private readonly logger = new Logger(CdcWorkerService.name);`
    // We can spy on the generic Logger.log if it delegates, but NestJS Logger instance is created in the class.
    // Better to mock Logger or spy on process.memoryUsage / process.cpuUsage since that's what we added.

    const cpuSpy = jest
      .spyOn(process, 'cpuUsage')
      .mockReturnValue({ user: 1000, system: 1000 });
    const memorySpy = jest.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 1024 * 1024 * 100, // 100MB
      heapTotal: 1024 * 1024 * 50, // 50MB
      heapUsed: 1024 * 1024 * 25, // 25MB
      external: 0,
      arrayBuffers: 0,
    });

    // We also want to confirm it LOGS.
    // Since `this.logger` is private, we can cast to any to spy on it,
    // OR we can rely on the fact that we saw the code logic.
    // Let's cast to any to verify the log call.
    const loggerSpy = jest
      .spyOn((service as any).logger, 'log')
      .mockImplementation(() => {});

    await service.pollChanges();

    expect(cpuSpy).toHaveBeenCalled();
    expect(memorySpy).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Resource Usage: Memory'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('100.00 MB'),
    ); // RSS check
  });
});
