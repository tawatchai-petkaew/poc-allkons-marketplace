import { Test, TestingModule } from '@nestjs/testing';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MasterData } from '@/model/master-data.entity';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('MasterDataController', () => {
  let controller: MasterDataController;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterDataController],
      providers: [
        MasterDataService,
        {
          provide: getRepositoryToken(MasterData),
          useValue: mockRepository,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MasterDataController>(MasterDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
