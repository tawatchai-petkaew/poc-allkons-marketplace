import { Test, TestingModule } from '@nestjs/testing';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { PublicApiKeyGuard } from '../../auth/api-key.guard';
import { OrganizationPermissionGuard } from '../../auth/guards/organization-permission.guard';
import { FlexibleCacheInterceptor } from '../../cache/flexible-cache.interceptor';
import * as UrlUtils from '../../utils/url.utils';
import * as Utils from '../../utils/utils';

jest.mock('../../utils/url.utils');
jest.mock('../../utils/utils');

describe('InvitationController', () => {
  let controller: InvitationController;
  let service: any;

  beforeEach(async () => {
    const mockService = {
      findByRefCode: jest.fn(),
      findByPhoneNumber: jest.fn(),
      respondToInvitation: jest.fn(),
      approveInvitation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [
        {
          provide: InvitationService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(PublicApiKeyGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OrganizationPermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(FlexibleCacheInterceptor)
      .useValue({ intercept: jest.fn() })
      .compile();

    controller = module.get<InvitationController>(InvitationController);
    service = module.get<InvitationService>(InvitationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInvitationByRefCode', () => {
    it('should return invitation', async () => {
      service.findByRefCode.mockResolvedValue({ id: 1 });
      const result = await controller.getInvitationByRefCode('ref');
      expect(service.findByRefCode).toHaveBeenCalledWith('ref');
      expect(result).toStrictEqual({ id: 1 });
    });
  });

  describe('getInvitationsByPhone', () => {
    it('should return invitation', async () => {
      const query: any = { countryCode: '66', phoneNumber: '123456789' };
      service.findByPhoneNumber.mockResolvedValue({ id: 1 });
      const result = await controller.getInvitationsByPhone(query);
      expect(service.findByPhoneNumber).toHaveBeenCalledWith(
        query.countryCode,
        query.phoneNumber,
        undefined,
      );
      expect(result).toStrictEqual({ id: 1 });
    });
  });

  describe('respondToInvitation', () => {
    it('should respond', async () => {
      service.respondToInvitation.mockResolvedValue({ status: 'success' });
      const result = await controller.respondToInvitation({} as any);
      expect(service.respondToInvitation).toHaveBeenCalled();
      expect(result).toStrictEqual({ status: 'success' });
    });
  });

  describe('approveInvitation', () => {
    it('should approve', async () => {
      (UrlUtils.getUrlOrigin as jest.Mock).mockReturnValue('origin');
      (Utils.getPlatform as jest.Mock).mockReturnValue('platform');
      service.approveInvitation.mockResolvedValue({ status: 'approved' });

      const req = { headers: {} };
      const result = await controller.approveInvitation(req, {} as any);

      expect(service.approveInvitation).toHaveBeenCalledWith(
        {},
        'origin',
        'platform',
      );
      expect(result).toStrictEqual({ status: 'approved' });
    });
  });
});
