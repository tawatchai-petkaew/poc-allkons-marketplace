import { Test, TestingModule } from '@nestjs/testing';
import { UserConsentController } from './user-consent.controller';
import { UserConsentService } from './user-consent.service';
import { PublicApiKeyGuard } from '@/auth/api-key.guard';

describe('UserConsentController', () => {
  let controller: UserConsentController;
  let userConsentService: any;

  beforeEach(async () => {
    userConsentService = {
      saveUserConsent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserConsentController],
      providers: [
        { provide: UserConsentService, useValue: userConsentService },
      ],
    })
      .overrideGuard(PublicApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserConsentController>(UserConsentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveUserConsent', () => {
    it('should save user consent', async () => {
      const dto = { phoneNumber: '123' };
      const result = { success: true };
      userConsentService.saveUserConsent.mockResolvedValue(result);

      expect(await controller.saveUserConsent(dto as any)).toBe(result);
      expect(userConsentService.saveUserConsent).toHaveBeenCalledWith(dto);
    });
  });
});
