import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Merchant } from '@/model';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestContext } from '@/model/request-context.model';

@Injectable()
export class MerchantMiddleware implements NestMiddleware<Request, Response> {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @Inject(CACHE_MANAGER) private cacheManager: any
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    if (req?.headers?.currentmerchantdomain) {
      const domain = Array.isArray(req.headers.currentmerchantdomain)
        ? req.headers.currentmerchantdomain[0]
        : req.headers.currentmerchantdomain;
      req.headers.currentmerchantslug = domain;

      const merchant = await this.merchantRepo.findOne({
        where: { domain }
      });
      if (merchant) {
        req.headers.currentmerchantslug = merchant.slug;
        (req as any).merchant = merchant;
      }
    } else {
      const slugHeader = req?.headers?.currentmerchantslug;
      const slug = Array.isArray(slugHeader) ? slugHeader[0] : slugHeader;

      if (slug && slug !== '-') {
        const value = await this.cacheManager.get(slug);

        if (value) {
          (req as any).merchant = value;
        } else {
          const merchant = await this.merchantRepo.findOne({
            where: { slug }
          });
          (req as any).merchant = merchant;

          if (merchant) {
            await this.cacheManager.set(slug, merchant, 1 * 60 * 60 * 1);
          }
        }
      }
    }

    // if (!(req as any).merchant) {
    //   throw new NotFoundException('Merchant not found');
    // }

    const requestContext = new RequestContext(req, res);
    RequestContext.cls.setContext(requestContext);

    next();
  }
}
