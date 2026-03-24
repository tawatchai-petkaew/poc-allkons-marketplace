import { Test, TestingModule } from '@nestjs/testing';
import { BuyerProjectController } from './buyer-project.controller';
import { BuyerProjectService } from './buyer-project.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

describe('BuyerProjectController', () => {
  let controller: BuyerProjectController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    existsByName: jest.fn(),
  };

  const mockReq = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyerProjectController],
      providers: [
        {
          provide: BuyerProjectService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BuyerProjectController>(BuyerProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return projects', async () => {
      mockService.findAll.mockResolvedValue([]);
      await expect(controller.findAll(mockReq, 'name')).resolves.toBeDefined();
    });

    it('should throw UnauthorizedException if no user', async () => {
      await expect(controller.findAll({}, 'name')).rejects.toThrow('User not authenticated');
    });
  });

  describe('create', () => {
    it('should create project', async () => {
      const dto = { userId: 1, name: 'proj' } as any;
      mockService.existsByName.mockResolvedValue(false);
      mockService.create.mockResolvedValue(dto);
      await expect(controller.create(dto, mockReq)).resolves.toBeDefined();
    });

    it('should throw if name duplicate', async () => {
        const dto = { userId: 1, name: 'proj' } as any;
        mockService.existsByName.mockResolvedValue(true);
        await expect(controller.create(dto, mockReq)).rejects.toThrow('Project name already exists');
      });
  });
});
