import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from './request-context.service';
import { UserService } from '@/modules/user/user.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { OrganizationService } from '../organization/organization.service';
import { RequestContext } from '@/model/request-context.model';
import { Merchant } from '@/model/merchant.entity';
import { Customer } from '@/model/customer.entity';
import { Admin } from '@/model/admin.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { Organization } from '@/model/organization.entity';

describe('RequestContextService', () => {
  let service: RequestContextService;
  let userService: jest.Mocked<UserService>;
  let userOrganizationService: jest.Mocked<UserOrganizationService>;
  let organizationService: jest.Mocked<OrganizationService>;

  const mockUserService = {
    requestCurrentMerchant: jest.fn(),
    requestMerchantBySlug: jest.fn(),
    requestCurrentCustomer: jest.fn(),
    requestCurrentAdmin: jest.fn(),
  };

  const mockUserOrganizationService = {
    requestCurrentUserOrganization: jest.fn(),
  };

  const mockOrganizationService = {
    findOrgById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestContextService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: UserOrganizationService,
          useValue: mockUserOrganizationService,
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    service = module.get<RequestContextService>(RequestContextService);
    userService = module.get(UserService);
    userOrganizationService = module.get(UserOrganizationService);
    organizationService = module.get(OrganizationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up RequestContext after each test
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('currentUser', () => {
    it('should return the current user from request context', () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockRequestContext = {
        req: { user: mockUser },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);

      const result = service.currentUser;

      expect(result).toEqual(mockUser);
    });

    it('should return null when request context is not available', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(null);

      const result = service.currentUser;

      expect(result).toBeNull();
    });
  });

  describe('currentMerchant', () => {
    it('should return the current merchant', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
      const mockRequestContext = {
        req: {
          user: mockUser,
          headers: { currentmerchantslug: 'test-merchant' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockUserService.requestCurrentMerchant.mockResolvedValue(mockMerchant);

      const result = await service.currentMerchant();

      expect(result).toEqual(mockMerchant);
      expect(mockUserService.requestCurrentMerchant).toHaveBeenCalledWith(mockUser, 'test-merchant');
    });
  });

  describe('currentMerchantOnSlug', () => {
    it('should return merchant by slug', async () => {
      const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
      const mockRequestContext = {
        req: {
          headers: { currentmerchantslug: 'test-merchant' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockUserService.requestMerchantBySlug.mockResolvedValue(mockMerchant);

      const result = await service.currentMerchantOnSlug();

      expect(result).toEqual(mockMerchant);
      expect(mockUserService.requestMerchantBySlug).toHaveBeenCalledWith('test-merchant');
    });
  });

  describe('currentCustomer', () => {
    it('should return the current customer', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockCustomer = { id: 1, fullName: 'John Doe' } as Customer;
      const mockRequestContext = {
        req: {
          user: mockUser,
          headers: { currentmerchantslug: 'test-merchant' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockUserService.requestCurrentCustomer.mockResolvedValue(mockCustomer);

      const result = await service.currentCustomer();

      expect(result).toEqual(mockCustomer);
      expect(mockUserService.requestCurrentCustomer).toHaveBeenCalledWith(mockUser, 'test-merchant');
    });
  });

  describe('currentPublicCustomer', () => {
    it('should return the current customer when user and merchant slug exist', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockCustomer = { id: 1, fullName: 'John Doe' } as Customer;
      const mockRequestContext = {
        req: {
          user: mockUser,
          headers: { currentmerchantslug: 'test-merchant' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockUserService.requestCurrentCustomer.mockResolvedValue(mockCustomer);

      const result = await service.currentPublicCustomer();

      expect(result).toEqual(mockCustomer);
      expect(mockUserService.requestCurrentCustomer).toHaveBeenCalledWith(mockUser, 'test-merchant');
    });

    it('should return undefined when user is not available', async () => {
      const mockRequestContext = {
        req: {
          user: null,
          headers: { currentmerchantslug: 'test-merchant' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);

      const result = await service.currentPublicCustomer();

      expect(result).toBeUndefined();
      expect(mockUserService.requestCurrentCustomer).not.toHaveBeenCalled();
    });

    it('should return undefined when merchant slug is not available', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockRequestContext = {
        req: {
          user: mockUser,
          headers: {},
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);

      const result = await service.currentPublicCustomer();

      expect(result).toBeUndefined();
      expect(mockUserService.requestCurrentCustomer).not.toHaveBeenCalled();
    });
  });

  describe('currentAdmin', () => {
    it('should return the current admin', async () => {
      const mockUser = { id: 1, username: 'testadmin' };
      const mockAdmin = { id: 1, fullName: 'Admin User' } as Admin;
      const mockRequestContext = {
        req: {
          user: mockUser,
          headers: { currentmerchantslug: 'test-merchant' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockUserService.requestCurrentAdmin.mockResolvedValue(mockAdmin);

      const result = await service.currentAdmin();

      expect(result).toEqual(mockAdmin);
      expect(mockUserService.requestCurrentAdmin).toHaveBeenCalledWith(mockUser, 'test-merchant');
    });
  });

  describe('currentUserOrganization', () => {
    it('should return the current user organization', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockUserOrganization: Partial<UserOrganization> = { id: 1, userId: 1 };
      const mockRequestContext = {
        req: {
          user: mockUser,
          authPayload: { organizeId: 5 },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockUserOrganizationService.requestCurrentUserOrganization.mockResolvedValue(mockUserOrganization as UserOrganization);

      const result = await service.currentUserOrganization();

      expect(result).toEqual(mockUserOrganization);
      expect(mockUserOrganizationService.requestCurrentUserOrganization).toHaveBeenCalledWith(mockUser, 5);
    });
  });

  describe('currentOrganization', () => {
    it('should return the current organization', async () => {
      const mockOrganization = { id: 10, taxId: '1234567890' } as Organization;
      const mockRequestContext = {
        req: {
          authPayload: { organizationId: 10 },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);
      mockOrganizationService.findOrgById.mockResolvedValue(mockOrganization);

      const result = await service.currentOrganization();

      expect(result).toEqual(mockOrganization);
      expect(mockOrganizationService.findOrgById).toHaveBeenCalledWith(10);
    });
  });

  describe('currentRequestId', () => {
    it('should return the current request ID', () => {
      const mockRequestContext = {
        req: {},
        requestId: 456,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);

      const result = service.currentRequestId;

      expect(result).toBe(456);
    });

    it('should return null when request context is not available', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(null);

      const result = service.currentRequestId;

      expect(result).toBeNull();
    });
  });

  describe('currentLang', () => {
    it('should return the current language from headers', () => {
      const mockRequestContext = {
        req: {
          headers: { lang: 'en' },
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);

      const result = service.currentLang;

      expect(result).toBe('en');
    });

    it('should return "th" as default when language header is not available', () => {
      const mockRequestContext = {
        req: {
          headers: {},
        },
        requestId: 123,
      };

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(mockRequestContext as any);

      const result = service.currentLang;

      expect(result).toBe('th');
    });

    it('should return "th" as default when request context is not available', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(null);

      const result = service.currentLang;

      expect(result).toBe('th');
    });
  });
});
