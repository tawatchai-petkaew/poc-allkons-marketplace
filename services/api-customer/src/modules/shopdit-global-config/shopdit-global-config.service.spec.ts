import { Test, TestingModule } from '@nestjs/testing';
import { ShopditGlobalConfigService } from './shopdit-global-config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopditGlobalConfig } from '../../model/shopdit-global-config.entity';
import { ShopditGlobalConfigDto } from './dto/shopdit-global-config.dto';
import { CreateShopditGlobalConfigDto } from './dto/create-shopdit-global-config.dto';
import { UpdateShopditGlobalConfigDto } from './dto/update-shopdit-global-config.dto';

describe('ShopditGlobalConfigService', () => {
  let service: ShopditGlobalConfigService;
  let repo: any;

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopditGlobalConfigService,
        {
          provide: getRepositoryToken(ShopditGlobalConfig),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ShopditGlobalConfigService>(
      ShopditGlobalConfigService,
    );
    repo = module.get(getRepositoryToken(ShopditGlobalConfig));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return dto if exists', async () => {
      const entity = { id: 1 } as any;
      repo.findOne.mockResolvedValue(entity);
      jest
        .spyOn(ShopditGlobalConfigDto, 'fromEntity')
        .mockReturnValue({ id: 1 } as any);

      expect(await service.get()).toEqual({ id: 1 });
    });

    it('should return null if not exists', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await service.get()).toBeNull();
    });
  });

  describe('createOrUpdate', () => {
    it('should update if exists', async () => {
      const entity = { id: 1 } as any;
      const dto = { prop: 'val' };
      repo.findOne.mockResolvedValue(entity);
      jest
        .spyOn(UpdateShopditGlobalConfigDto, 'toEntity')
        .mockReturnValue({ prop: 'val' } as any);
      repo.save.mockResolvedValue({ id: 1, prop: 'val' });

      expect(await service.createOrUpdate(dto)).toEqual({ id: 1, prop: 'val' });
      expect(repo.save).toHaveBeenCalled();
    });

    it('should create if not exists', async () => {
      const dto = { prop: 'val' };
      repo.findOne.mockResolvedValue(null);
      jest
        .spyOn(CreateShopditGlobalConfigDto, 'toEntity')
        .mockReturnValue({ prop: 'val' } as any);
      repo.save.mockResolvedValue({ id: 1, prop: 'val' });

      expect(await service.createOrUpdate(dto)).toEqual({ id: 1, prop: 'val' });
      expect(repo.save).toHaveBeenCalled();
    });
  });
});
