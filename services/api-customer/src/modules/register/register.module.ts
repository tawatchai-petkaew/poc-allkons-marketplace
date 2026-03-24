import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthCenterModule } from '../auth-center/auth-center.module';
import { CisModule } from '../cis/cis.module';
import { MerchantModule } from '../merchant/merchant.module';
import { OrganizationConsentModule } from '../organization-consent/organization-consent.module';
import { OrganizationContactModule } from '../organization-contact/organization-contact.module';
import { OrganizationModule } from '../organization/organization.module';
import { RoleModule } from '../role/role.module';
import { UserAddressModule } from '../user-address/user-address.module';
import { UserConsentModule } from '../user-consent/user-consent.module';
import { UserMerchantModule } from '../user-merchant/user-merchant.module';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { UserModule } from '../user/user.module';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CisModule,
    AuthCenterModule,
    UserModule,
    MerchantModule,
    OrganizationModule,
    UserOrganizationModule,
    UserConsentModule,
    OrganizationConsentModule,
    OrganizationContactModule,
    UserMerchantModule,
    MerchantModule,
    UserAddressModule,
    RoleModule,
  ],
  controllers: [RegisterController],
  providers: [
    RegisterService,
    {
      provide: 'CIS_API_KEY',
      useValue: process.env.CIS_API_KEY,
    },
    {
      provide: 'CIS_PLATFORM_SELLER_KEY',
      useValue: process.env.CIS_PLATFORM_SELLER_KEY,
    },
    {
      provide: 'CIS_URL',
      useValue: process.env.CIS_URL,
    },
    {
      provide: 'APP_ID_SELLER',
      useValue: process.env.APP_ID_SELLER,
    },
    {
      provide: 'AUTH_CENTER_URL',
      useValue: process.env.AUTH_CENTER_URL,
    },
    {
      provide: 'AUTH_CLIENT_ID',
      useValue: process.env.AUTH_CLIENT_ID,
    },
    {
      provide: 'AUTH_CLIENT_SECRET',
      useValue: process.env.AUTH_CLIENT_SECRET,
    },
  ],
  exports: [RegisterService],
})
export class RegisterModule {}
