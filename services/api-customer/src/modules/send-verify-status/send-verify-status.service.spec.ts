import { Test, TestingModule } from '@nestjs/testing';
import { SendVerifyStatusService } from './send-verify-status.service';
import { ThaiBulkSmsService } from '../thai-bulk-sms/thai-bulk-sms.service';
import { OrganizationService } from '../organization/organization.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { KycStatusCIS } from '../cis/enum/cis.enum';
import { UserOrganizationRole } from '../user/enum/user.enum';

describe('SendVerifyStatusService', () => {
  let service: SendVerifyStatusService;
  let thaiBulkSmsService: any;
  let organizationService: any;
  let userOrganizationService: any;

  beforeEach(async () => {
    const mockThaiBulkSmsService = {
      sendSms: jest.fn(),
    };
    const mockOrganizationService = {
      findOrgByCisNumber: jest.fn(),
    };
    const mockUserOrganizationService = {
      findUsersByOrgId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendVerifyStatusService,
        { provide: ThaiBulkSmsService, useValue: mockThaiBulkSmsService },
        { provide: OrganizationService, useValue: mockOrganizationService },
        {
          provide: UserOrganizationService,
          useValue: mockUserOrganizationService,
        },
      ],
    }).compile();

    service = module.get<SendVerifyStatusService>(SendVerifyStatusService);
    thaiBulkSmsService = module.get<ThaiBulkSmsService>(ThaiBulkSmsService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    userOrganizationService = module.get<UserOrganizationService>(
      UserOrganizationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerifyStatusViaSMS', () => {
    it('should return undefined if status is NONE', async () => {
      expect(
        await service.sendVerifyStatusViaSMS({
          kycStatus: KycStatusCIS.NONE,
        } as any),
      ).toBeUndefined();
    });

    it('should throw if cisNumber is missing', async () => {
      await expect(
        service.sendVerifyStatusViaSMS({
          kycStatus: KycStatusCIS.APPROVE,
          cisNumber: '',
        } as any),
      ).rejects.toThrow(
        new HttpException('Cis number is missing', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw if organization not found', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue(null);
      await expect(
        service.sendVerifyStatusViaSMS({
          kycStatus: KycStatusCIS.APPROVE,
          cisNumber: 'cis',
        } as any),
      ).rejects.toThrow(
        new HttpException('Organization is not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw if no members', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue({ id: 1 });
      userOrganizationService.findUsersByOrgId.mockResolvedValue([]);
      await expect(
        service.sendVerifyStatusViaSMS({
          kycStatus: KycStatusCIS.APPROVE,
          cisNumber: 'cis',
        } as any),
      ).rejects.toThrow(
        new HttpException(
          'Organization has no members to send sms',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw if no eligible receivers (SUPER_ADMIN or OWNER)', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue({ id: 1 });
      userOrganizationService.findUsersByOrgId.mockResolvedValue([
        { role: { name: 'MEMBER' } },
      ]);
      await expect(
        service.sendVerifyStatusViaSMS({
          kycStatus: KycStatusCIS.APPROVE,
          cisNumber: 'cis',
        } as any),
      ).rejects.toThrow(
        new HttpException(
          'Organization has no members to send sms',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw if message template is empty', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue({
        id: 1,
        organizeName: 'Org',
      });
      userOrganizationService.findUsersByOrgId.mockResolvedValue([
        {
          role: { name: UserOrganizationRole.OWNER },
          user: { tel: '1', countryCode: '66' },
        },
      ]);
      // Invalid status for template
      await expect(
        service.sendVerifyStatusViaSMS({
          kycStatus: 'INVALID' as any,
          cisNumber: 'cis',
        } as any),
      ).rejects.toThrow(
        new HttpException(
          'Message template is empty. Invalid Kyc status',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should send sms for APPROVED status', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue({
        id: 1,
        organizeName: 'Org',
      });
      userOrganizationService.findUsersByOrgId.mockResolvedValue([
        {
          role: { name: UserOrganizationRole.OWNER },
          user: { tel: '1', countryCode: '66' },
        },
      ]);

      const res = await service.sendVerifyStatusViaSMS({
        kycStatus: KycStatusCIS.APPROVE,
        cisNumber: 'cis',
      } as any);
      expect(res.status).toBe('SUCCESS');
      expect(thaiBulkSmsService.sendSms).toHaveBeenCalled();
    });

    it('should send sms for REJECT status', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue({
        id: 1,
        organizeName: 'Org',
      });
      userOrganizationService.findUsersByOrgId.mockResolvedValue([
        {
          role: { name: UserOrganizationRole.OWNER },
          user: { tel: '1', countryCode: '66' },
        },
      ]);

      const res = await service.sendVerifyStatusViaSMS({
        kycStatus: KycStatusCIS.REJECT,
        cisNumber: 'cis',
        reason: 'bad',
      } as any);
      expect(res.status).toBe('SUCCESS');
      expect(thaiBulkSmsService.sendSms).toHaveBeenCalled();
    });

    it('should throw if REJECT but reason missing', async () => {
      organizationService.findOrgByCisNumber.mockResolvedValue({
        id: 1,
        organizeName: 'Org',
      });
      userOrganizationService.findUsersByOrgId.mockResolvedValue([
        {
          role: { name: UserOrganizationRole.OWNER },
          user: { tel: '1', countryCode: '66' },
        },
      ]);

      await expect(
        service.sendVerifyStatusViaSMS({
          kycStatus: KycStatusCIS.REJECT,
          cisNumber: 'cis',
        } as any),
      ).rejects.toThrow(
        new HttpException('Failed Reason is empty', HttpStatus.BAD_REQUEST),
      );
    });

    // Async error handling in forEach is tricky because the service makes it async but doesn't await the forEach promises
    // receivers.forEach(async (receiver) => { ... }) waits for nobody.
    // But we can verify attempts were made.
    // If we want to test exception inside the loop, it won't be caught by the main try-catch if it's awaited?
    // Actually the code `receivers.forEach(async ...)` launches independent promises. They might fail silently or unhandled rejection.
    // The service catches inside the loop: `catch (err) { throw ... }`.
    // Throwing inside async callback of forEach will result in UnhandledPromiseRejection, it won't propagate to the caller of `sendVerifyStatusViaSMS`.
    // This is a potential bug in the implementation, but I'm just testing it.
    // If I want to test that calls happen, that works.
  });

  describe('getMessageTemplate', () => {
    it('should return approv msg', () => {
      expect(
        service.getMessageTemplate({
          kycStatus: KycStatusCIS.APPROVE,
          orgName: 'A',
        } as any),
      ).toContain('ได้รับการอนุมัติ');
    });
  });
});
