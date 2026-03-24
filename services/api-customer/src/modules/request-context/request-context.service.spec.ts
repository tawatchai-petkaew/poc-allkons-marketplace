import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from './request-context.service';
import { UserService } from '@/modules/user/user.service';
import { RequestContext } from '@/model/request-context.model';

describe('RequestContextService', () => {
  let service: RequestContextService;
  let userService: any;

  const mockUserService = {
    requestCurrentMerchant: jest.fn(),
    requestMerchantBySlug: jest.fn(),
    requestCurrentCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestContextService,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<RequestContextService>(RequestContextService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('currentUser', () => {
    it('should return user from context', () => {
      const user = { id: 1 };
      jest
        .spyOn(RequestContext, 'currentContext', 'get')
        .mockReturnValue({ req: { user } } as any);
      expect(service.currentUser).toBe(user);
    });

    it('should return null if no context', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(null);
      expect(service.currentUser).toBeNull();
    });
  });

  describe('currentMerchant', () => {
    it('should return merchant', async () => {
      const user = { id: 1 };
      const slug = 'slug';
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
        req: { user, headers: { currentmerchantslug: slug } },
      } as any);
      const expected = { id: 1 };
      mockUserService.requestCurrentMerchant.mockResolvedValue(expected);

      const result = await service.currentMerchant();
      expect(result).toBe(expected);
      expect(mockUserService.requestCurrentMerchant).toHaveBeenCalledWith(
        user,
        slug,
      );
    });
  });

  describe('currentMerchantOnSlug', () => {
    it('should return merchant by slug', async () => {
      const slug = 'slug';
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
        req: { headers: { currentmerchantslug: slug } },
      } as any);
      const expected = { id: 1 };
      mockUserService.requestMerchantBySlug.mockResolvedValue(expected);

      const result = await service.currentMerchantOnSlug();
      expect(result).toBe(expected);
      expect(mockUserService.requestMerchantBySlug).toHaveBeenCalledWith(slug);
    });
  });

  describe('currentCustomer', () => {
    it('should return customer', async () => {
      const user = { id: 1 };
      const slug = 'slug';
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
        req: { user, headers: { currentmerchantslug: slug } },
      } as any);
      const expected = { id: 1 };
      mockUserService.requestCurrentCustomer.mockResolvedValue(expected);

      const result = await service.currentCustomer();
      expect(result).toBe(expected);
      expect(mockUserService.requestCurrentCustomer).toHaveBeenCalledWith(
        user,
        slug,
      );
    });
  });

  describe('currentRequestId', () => {
    it('should return requestId', () => {
      const requestId = 12345;
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
        requestId,
      } as any);
      expect(service.currentRequestId).toBe(requestId);
    });

    it('should return null if no context', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(null);
      expect(service.currentRequestId).toBeNull();
    });
  });

  describe('currentLang', () => {
    it('should return lang from headers', () => {
      const lang = 'en';
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
        req: { headers: { lang } },
      } as any);
      expect(service.currentLang).toBe(lang);
    });

    it('should return th if no context', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue(null);
      expect(service.currentLang).toBe('th');
    });

    it('should return th if lang missing', () => {
      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
        req: { headers: {} },
      } as any);
      expect(service.currentLang).toBe('th');
    });
  });
});
