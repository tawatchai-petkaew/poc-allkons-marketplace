import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationConsentController } from './organization-consent.controller';
import { OrganizationConsentService } from './organization-consent.service';
import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { SaveOrganizationConsentDto } from './dto/save-organization-consent.dto';
import { SaveOrganizationConsentResponseDto } from './dto/save-organization-consent-response.dto';

describe('OrganizationConsentController', () => {
  let controller: OrganizationConsentController;
  let service: OrganizationConsentService;

  const mockService = {
    saveOrganizationConsent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationConsentController],
      providers: [
        {
          provide: OrganizationConsentService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(PublicApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrganizationConsentController>(
      OrganizationConsentController,
    );
    service = module.get<OrganizationConsentService>(
      OrganizationConsentService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveOrganizationConsent', () => {
    it('should call service.saveOrganizationConsent', async () => {
      const dto: SaveOrganizationConsentDto = {
        organizationId: 1,
        consentIds: [1],
      };
      const expectedResult =
        SaveOrganizationConsentResponseDto.create('success');
      mockService.saveOrganizationConsent.mockResolvedValue(expectedResult);

      const result = await controller.saveOrganizationConsent(dto);

      expect(service.saveOrganizationConsent).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
