import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { Merchant } from '@/model/merchant.entity';
import { Customer } from '@/model/customer.entity';
import { RequestContext } from '@/model/request-context.model';
import { UserOrganization } from '@/model/user-organization.entity';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { Organization } from '@/model/organization.entity';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class RequestContextService {
  constructor(
    private readonly userService: UserService,
    private readonly userOrganizationService: UserOrganizationService,
    private readonly organizationService: OrganizationService,
  ) {}

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

  public async currentPublicCustomer() {
    const requestContext = this.currentRequest;
    const customer: Customer =
      requestContext.req.user && requestContext.req.headers.currentmerchantslug
        ? await this.userService.requestCurrentCustomer(
            requestContext.req.user,
            requestContext.req.headers.currentmerchantslug,
          )
        : undefined;

    return customer;
  }

  public async currentAdmin() {
    const requestContext = this.currentRequest;

    return null;
  }

  public async currentUserOrganization() {
    const requestContext = this.currentRequest;
    const userOrganization: UserOrganization =
      await this.userOrganizationService.requestCurrentUserOrganization(
        requestContext.req.user,
        +(requestContext.req as any).authPayload.organizeId,
      );
    return userOrganization;
  }

  public async currentOrganization() {
    const requestContext = this.currentRequest;
    const organization: Organization =
      await this.organizationService.findOrgById(
        +(requestContext.req as any).authPayload.organizationId,
      );
    return organization;
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
