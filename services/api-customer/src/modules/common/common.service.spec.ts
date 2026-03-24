import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventLog } from '../../model/event-log.entity';

describe('CommonService', () => {
  let service: CommonService;
  let repo: any;

  const mockRepo = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonService,
        {
          provide: getRepositoryToken(EventLog),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CommonService>(CommonService);
    repo = module.get(getRepositoryToken(EventLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('writeLog', () => {
    it('should save log successfully', async () => {
      await service.writeLog('url', 'method', 'data', 'response', 1, 1);
      expect(repo.save).toHaveBeenCalledWith({
        url: 'url',
        function: 'method',
        data: 'data',
        response: 'response',
        organizeId: 1,
        userId: 1,
      });
    });

    it('should handle error when save fails', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      repo.save.mockRejectedValueOnce(new Error('Save failed'));

      await service.writeLog('url');

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('readLog', () => {
    it('should read log by organizeId', async () => {
      const logs = [{ id: 1 }];
      repo.find.mockResolvedValue(logs);

      const result = await service.readLog('url', 'method', 1);

      expect(repo.find).toHaveBeenCalledWith({
        where: { url: 'url', method: 'method', organizeId: 1 },
      });
      expect(result).toEqual(logs);
    });

    it('should read log by userId', async () => {
      const logs = [{ id: 1 }];
      repo.find.mockResolvedValue(logs);

      // organizeId is null, so it should query by userId
      const result = await service.readLog('url', 'method', null, 1);

      expect(repo.find).toHaveBeenCalledWith({
        where: { url: 'url', method: 'method', userId: 1 },
      });
      expect(result).toEqual(logs);
    });

    it('should handle error when find fails', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      repo.find.mockRejectedValueOnce(new Error('Find failed'));

      await service.readLog();

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('readLogByOrganizeId', () => {
    it('should return latest log for organizeId', async () => {
      const log = { id: 1 };
      repo.findOne.mockResolvedValue(log);

      const result = await service.readLogByOrganizeId(1);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { organizeId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(log);
    });

    it('should handle error when findOne fails', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      repo.findOne.mockRejectedValueOnce(new Error('FindOne failed'));

      await service.readLogByOrganizeId(1);

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
