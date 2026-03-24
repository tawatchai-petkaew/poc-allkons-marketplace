import { Test, TestingModule } from '@nestjs/testing';
import { ConsentMessageController } from './consent-message.controller';
import { ConsentMessageService } from './consent-message.service';
import { PublicApiKeyGuard } from '../../auth/api-key.guard';
import {
  ConsentLanguage,
  ConsentType,
} from '../../model/consent-message.entity';

describe('ConsentMessageController', () => {
  let controller: ConsentMessageController;
  let service: any;

  const mockService = {
    findByTypeAndOptions: jest.fn(),
    syncConsentMessage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsentMessageController],
      providers: [
        {
          provide: ConsentMessageService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(PublicApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ConsentMessageController>(ConsentMessageController);
    service = module.get<ConsentMessageService>(ConsentMessageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConsentMessage', () => {
    it('should return consent message', async () => {
      const mockResult = {
        id: 1,
        consentType: ConsentType.PRIVACY_POLICY,
        content: 'test',
        version: 'v1',
      };
      mockService.findByTypeAndOptions.mockResolvedValue(mockResult);

      const queryDto = {
        type: ConsentType.PRIVACY_POLICY,
        language: ConsentLanguage.TH,
      };

      const result = await controller.getConsentMessage(queryDto as any);

      expect(service.findByTypeAndOptions).toHaveBeenCalledWith(
        [ConsentType.PRIVACY_POLICY],
        undefined,
        ConsentLanguage.TH,
      );
      expect(result).toHaveProperty('id', 1);
    });

    it('should handle array of messages', async () => {
      const mockResults = [{ id: 1 }, { id: 2 }];
      mockService.findByTypeAndOptions.mockResolvedValue(mockResults);

      const result = await controller.getConsentMessage({
        types: [ConsentType.PRIVACY_POLICY],
      } as any);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });

  describe('syncConsentMessage', () => {
    it('should call service sync', async () => {
      await controller.syncConsentMessage();
      expect(service.syncConsentMessage).toHaveBeenCalled();
    });
  });
});
