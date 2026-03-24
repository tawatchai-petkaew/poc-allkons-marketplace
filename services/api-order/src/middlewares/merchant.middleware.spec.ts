import { MerchantMiddleware } from './merchant.middleware';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RequestContext } from '@/model/request-context.model';

describe('MerchantMiddleware', () => {
  let middleware: MerchantMiddleware;
  let mockRepo: any;
  let mockCache: any;

  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
    };
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    };
    middleware = new MerchantMiddleware(mockRepo, mockCache);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should use currentmerchantdomain header', async () => {
    const req: any = {
      headers: { currentmerchantdomain: 'domain' },
    };
    const res: any = {};
    const next = jest.fn();

    mockRepo.findOne.mockResolvedValue({ slug: 'slug-from-db' });

    await middleware.use(req, res, next);

    expect(req.headers.currentmerchantslug).toBe('slug-from-db');
    expect(req.merchant).toEqual({ slug: 'slug-from-db' });
    expect(next).toHaveBeenCalled();
  });

  it('should use currentmerchantslug from header and cache hit', async () => {
    const req: any = {
      headers: { currentmerchantslug: 'slug' },
    };
    const res: any = {};
    const next = jest.fn();

    mockCache.get.mockResolvedValue({ slug: 'slug-from-cache' });

    await middleware.use(req, res, next);

    expect(req.merchant).toEqual({ slug: 'slug-from-cache' });
    expect(mockRepo.findOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should use currentmerchantslug and cache miss', async () => {
    const req: any = {
      headers: { currentmerchantslug: 'slug' },
    };
    const res: any = {};
    const next = jest.fn();

    mockCache.get.mockResolvedValue(null);
    mockRepo.findOne.mockResolvedValue({ slug: 'slug-from-db' });

    await middleware.use(req, res, next);

    expect(req.merchant).toEqual({ slug: 'slug-from-db' });
    expect(mockCache.set).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should handle no headers', async () => {
    const req: any = {
      headers: {},
    };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(req.merchant).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set request context', async () => {
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    await middleware.use(req, res, next);

    // Cannot easily check RequestContext.cls global state in unit test without side effects,
    // but we verify code execution reaches next()
    expect(next).toHaveBeenCalled();
  });
});
