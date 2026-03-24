import { Test, TestingModule } from '@nestjs/testing';
import { MasterDataService } from './master-data.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MasterData } from '@/model/master-data.entity';

describe('MasterDataService', () => {
  let service: MasterDataService;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterDataService,
        {
          provide: getRepositoryToken(MasterData),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MasterDataService>(MasterDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
