import { Test, TestingModule } from '@nestjs/testing';
import { BuyerProjectService } from './buyer-project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from '@/model/project.entity';

describe('BuyerProjectService', () => {
  let service: BuyerProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyerProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
            })),
            manager: {
              connection: {
                createQueryRunner: jest.fn(() => ({
                  connect: jest.fn(),
                  startTransaction: jest.fn(),
                  commitTransaction: jest.fn(),
                  rollbackTransaction: jest.fn(),
                  release: jest.fn(),
                  manager: {
                    createQueryBuilder: jest.fn(() => ({
                      update: jest.fn().mockReturnThis(),
                      set: jest.fn().mockReturnThis(),
                      where: jest.fn().mockReturnThis(),
                      execute: jest.fn(),
                    })),
                    delete: jest.fn(),
                  },
                })),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<BuyerProjectService>(BuyerProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
