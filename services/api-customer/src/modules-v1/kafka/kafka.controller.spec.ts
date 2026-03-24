import { Test, TestingModule } from '@nestjs/testing';
import { KafkaController, KafkaMessage } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { PublicApiKeyGuard } from '@/auth/api-key.guard';

describe('KafkaController', () => {
  let controller: KafkaController;
  let service: any;

  const mockService = {
    processAddressCreation: jest.fn(),
    processAddressUpdate: jest.fn(),
    processAddressDelete: jest.fn(),
    processKycStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaController],
      providers: [
        {
          provide: KafkaService,
          useValue: mockService,
        },
      ],
    })
    .overrideGuard(PublicApiKeyGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<KafkaController>(KafkaController);
    service = module.get<KafkaService>(KafkaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleAddressCreate', () => {
    it('should call service.processAddressCreation', async () => {
      const message: KafkaMessage = {
        address_id: '1',
        cis_number: '123',
        create_at: '2023-01-01',
        create_by: 'test',
        create_by_platform: 'test',
      };
      await controller.handleAddressCreate(message);
      expect(mockService.processAddressCreation).toHaveBeenCalledWith(message);
    });

    it('should handle errors', async () => {
      mockService.processAddressCreation.mockRejectedValue(new Error('Service error'));
      const message: KafkaMessage = {
        address_id: '1',
        cis_number: '123',
        create_at: '2023-01-01',
        create_by: 'test',
        create_by_platform: 'test',
      };
      // The controller catches error and logs it, so it shouldn't throw
      await expect(controller.handleAddressCreate(message)).resolves.not.toThrow();
    });
  });
});
