import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ArticlePublicModule } from './modules/article-public/article-public.module';
import { ArticleModule } from './modules/article/article.module';
import { BannerMerchantPublicModule } from './modules/banner-merchant-public/banner-merchant-public.module';
import { BannerMerchantModule } from './modules/banner-merchant/banner-merchant.module';
import { BannerPromotionPublicModule } from './modules/banner-promotion-public/banner-promotion-public.module';
import { BannerPromotionModule } from './modules/banner-promotion/banner-promotion.module';
import { BigqueryModule } from './modules/bigquery/bigquery.module';
import { CisModule } from './modules/cis/cis.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';
import { CommonModule } from './modules/common/common.module';
import { ConsentMessageModule } from './modules/consent-message/consent-message.module';
import { CustomerPublicModule } from './modules/customer-public/customer-public.module';
import { CustomerModule } from './modules/customer/customer.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { ImageUploadFolderModule } from './modules/image-upload-folder/image-upload-folder.module';
import { ImageUploadModule } from './modules/image-upload/image-upload.module';
import { IngressModule } from './modules/ingress/ingress.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { LocationModule } from './modules/location/location.module';
import { MerchantCategoryModule } from './modules/merchant-category/merchant-category.module';
import { MerchantPublicModule } from './modules/merchant-public/merchant-public.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { OrganizationConsentModule } from './modules/organization-consent/organization-consent.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RegisterModule } from './modules/register/register.module';
import { RequestContextModule } from './modules/request-context/request-context.module';
import { RoleModule } from './modules/role/role.module';
import { SendVerifyStatusModule } from './modules/send-verify-status/send-verify-status.module';
import { ShopditGlobalConfigModule } from './modules/shopdit-global-config/shopdit-global-config.module';
import { StoreModule } from './modules/store/store.module';
import { SubdomainCronModule } from './modules/subdomain-cron/subdomain-cron.module';
import { ThaiBulkSmsModule } from './modules/thai-bulk-sms/thai-bulk-sms.module';
import { UserConsentModule } from './modules/user-consent/user-consent.module';
import { UserOrganizationModule } from './modules/user-organization/user-organization.module';
import { UserModule } from './modules/user/user.module';
import { StaticModule } from './static/static.module';

@Module({
  imports: [
    RequestContextModule,
    UserModule,
    AuthModule,
    MerchantModule,
    MerchantPublicModule,
    StoreModule,
    StaticModule,
    ImageUploadModule,
    ImageUploadFolderModule,
    CustomerModule,
    BannerMerchantModule,
    BannerPromotionModule,
    BannerMerchantPublicModule,
    BannerPromotionPublicModule,
    ArticleModule,
    ArticlePublicModule,
    CustomerPublicModule,
    FileUploadModule,
    // ShopeeModule.register({
    //   partnerId: process.env.SHOPEE_PARTNER_ID || '',
    //   partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    //   redirectUrl: process.env.SHOPEE_REDIRECT_BASE_URL || '',
    //   baseUrl: process.env.SHOPEE_API_BASE_URL || '',
    //   authorizedRedirectUrl: process.env.SHOPDIT_SHOPEE_PRODUCT_LIST_URL || ''
    // }),
    ShopditGlobalConfigModule,
    BigqueryModule,
    RegisterModule,
    CisModule,
    ConsentMessageModule,
    UserConsentModule,
    OrganizationModule,
    UserOrganizationModule,
    RoleModule,
    PermissionModule,
    LocationModule,
    CloudflareModule,
    OrganizationConsentModule,
    ThaiBulkSmsModule,
    SendVerifyStatusModule,
    CommonModule,
    SubdomainCronModule,
    IngressModule,
    InvitationModule,
    MerchantCategoryModule,
  ],
})
export class AppV0Module {}
