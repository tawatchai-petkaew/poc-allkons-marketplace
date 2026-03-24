import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: OrganizationService;

  const mockService = {
    createNewOrganization: jest.fn(),
    createOrganization: jest.fn(),
    getIdentityVerification: jest.fn(),
    updateIdentityVerification: jest.fn(),
    checkTaxId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: mockService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(PublicApiKeyGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OrganizationPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrganizationController>(OrganizationController);
    service = module.get<OrganizationService>(OrganizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should call service.createNewOrganization', async () => {
      const dto: any = { organizeName: 'Test' };
      const req: any = { user: { id: 1 }, headers: { 'app-id': 'abc' } };
      mockService.createOrganization.mockResolvedValue({ id: 1 });
      // The controller calls createNewOrganization, so we must mock that or map it in our mock object
      mockService.createNewOrganization.mockResolvedValue({ id: 1 });

      await controller.createOrganization(req, dto);

      // The controller logic checks APP_ID_BUYER from process.env, which is likely undefined here, defaulting to SELLER.
      // We can check if it was called with dto and ANY platform enum.
      expect(mockService.createNewOrganization).toHaveBeenCalledWith(
        dto,
        expect.anything(),
      );
    });
  });

  describe('getIdentityVerification', () => {
    it('should return identity verification data', async () => {
      const id = '1';
      const expected = { id: 1, organizeName: 'Test' };
      mockService.getIdentityVerification.mockResolvedValue(expected);

      const result = await controller.getIdentityVerification(id);

      expect(mockService.getIdentityVerification).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  describe('updateIdentityVerification', () => {
    it('should update identity verification', async () => {
      const id = 1;
      const dto: any = { sendApproval: true };
      const expected = { success: true };
      mockService.updateIdentityVerification.mockResolvedValue(expected);

      const result = await controller.updateIdentityVerification(id, dto);

      expect(mockService.updateIdentityVerification).toHaveBeenCalledWith(
        id,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('checkTaxId', () => {
    it('should check tax ID', async () => {
      const dto: any = { taxId: '123' };
      const expected = { isValid: true };
      mockService.checkTaxId.mockResolvedValue(expected);

      // Controller extracts fields: taxId, organizeBranchNumber, organizationId
      await controller.checkTaxId(dto);

      expect(mockService.checkTaxId).toHaveBeenCalledWith(
        '123',
        undefined,
        undefined,
      );
    });
  });
});
