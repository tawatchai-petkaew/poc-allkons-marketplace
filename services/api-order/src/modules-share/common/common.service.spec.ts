import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventLog } from '@/model/event-log.entity';
import { Repository } from 'typeorm';

describe('CommonService', () => {
  let service: CommonService;
  let repo: Repository<EventLog>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonService,
        {
          provide: getRepositoryToken(EventLog),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommonService>(CommonService);
    repo = module.get<Repository<EventLog>>(getRepositoryToken(EventLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('writeLog', () => {
    it('should save log', async () => {
      await service.writeLog('url', 'GET', '{}', '{}', 1, 1);
      expect(repo.save).toHaveBeenCalled();
    });

    it('should catch error', async () => {
      repo.save = jest.fn().mockRejectedValue(new Error('fail'));
      // should not throw
      await service.writeLog('url', 'GET', '{}', '{}', 1, 1);
    });
  });

  describe('readLog', () => {
    it('should find logs by organizeId', async () => {
      repo.find = jest.fn().mockResolvedValue([]);
      await service.readLog('url', 'GET', 1, null);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizeId: 1 }),
        }),
      );
    });

    it('should find logs by userId', async () => {
      repo.find = jest.fn().mockResolvedValue([]);
      await service.readLog('url', 'GET', null, 1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 1 }),
        }),
      );
    });

    it('should catch error', async () => {
      repo.find = jest.fn().mockRejectedValue(new Error('fail'));
      await service.readLog('url', 'GET', 1, 1);
    });
  });

  describe('readLogByOrganizeId', () => {
    it('should find log', async () => {
      repo.findOne = jest.fn().mockResolvedValue({});
      await service.readLogByOrganizeId(1);
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should catch error', async () => {
      repo.findOne = jest.fn().mockRejectedValue(new Error('fail'));
      await service.readLogByOrganizeId(1);
    });
  });
});
