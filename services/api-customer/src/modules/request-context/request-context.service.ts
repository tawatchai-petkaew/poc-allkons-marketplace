import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { Merchant } from '@/model/merchant.entity';
import { Customer } from '@/model/customer.entity';
import { RequestContext } from '@/model/request-context.model';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class RequestContextService {
  constructor(private readonly userService: UserService) {}

  get currentUser() {
    const requestContext = this.currentRequest;
    return (requestContext && requestContext.req.user) || null;
  }

  public async currentMerchant() {
    const requestContext = this.currentRequest;
    const merchant: Merchant = await this.userService.requestCurrentMerchant(
      requestContext.req.user,
      requestContext.req.headers.currentmerchantslug,
    );

    return merchant;
  }

  public async currentMerchantOnSlug() {
    const requestContext = this.currentRequest;
    const merchant: Merchant = await this.userService.requestMerchantBySlug(
      requestContext.req.headers.currentmerchantslug,
    );

    return merchant;
  }

  public async currentCustomer() {
    const requestContext = this.currentRequest;
    const customer: Customer = await this.userService.requestCurrentCustomer(
      requestContext.req.user,
      requestContext.req.headers.currentmerchantslug,
    );

    return customer;
  }

  get currentRequestId(): number | null {
    const requestContext = this.currentRequest;
    return (requestContext && requestContext.requestId) || null;
  }

  get currentLang() {
    const requestContext = this.currentRequest;
    return (requestContext && requestContext.req.headers.lang) || 'th';
  }

  private get currentRequest() {
    const requestContext = RequestContext.currentContext;
    return requestContext || null;
  }
}
