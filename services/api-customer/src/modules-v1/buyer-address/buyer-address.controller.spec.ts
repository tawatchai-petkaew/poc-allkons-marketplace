import { Test, TestingModule } from '@nestjs/testing';
import { BuyerAddressController } from './buyer-address.controller';
import { BuyerAddressService } from './buyer-address.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';
import { CisService } from '@/modules/cis/cis.service';

describe('BuyerAddressController', () => {
  let controller: BuyerAddressController;
  let service: any;

  const mockService = {
    createAddress: jest.fn(),
    existsByAddress: jest.fn(),
    findAllAddress: jest.fn(),
    findOneAddress: jest.fn(),
    updateAddress: jest.fn(),
    removeAddress: jest.fn(),
  };

  const mockReq = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyerAddressController],
      providers: [
        {
          provide: BuyerAddressService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(UserCustomerAddressEntity),
          useValue: {},
        },
        {
          provide: CisService,
          useValue: {},
        }
      ],
    }).compile();

    controller = module.get<BuyerAddressController>(BuyerAddressController);
    service = module.get<BuyerAddressService>(BuyerAddressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return addresses', async () => {
      mockService.findAllAddress.mockResolvedValue([]);
      await expect(controller.findAll(mockReq)).resolves.toBeDefined();
    });

    it('should throw UnauthorizedException if no user', async () => {
      await expect(controller.findAll({})).rejects.toThrow('User not authenticated');
    });
  });

  describe('create', () => {
    it('should create address', async () => {
       const dto = { userId: 1 } as any;
       mockService.createAddress.mockResolvedValue(dto);
       await expect(controller.create(dto, mockReq)).resolves.toBeDefined();
    });
    
    it('should throw if userId mismatch', async () => {
        const dto = { userId: 2 } as any;
        await expect(controller.create(dto, mockReq)).rejects.toThrow('User ID does not match');
     });
  });
});
