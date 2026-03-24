import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../modules/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { User } from '../model/user.entity';
import { Merchant } from '../model/merchant.entity';
import { Customer } from '../model/customer.entity';
import { CustomerAddress } from '../model/customer-address.entity';
import { Cart } from '../model/cart.entity';
import { ImageUpload } from '../model/image-upload.entity';
import { ImageUploadFolder } from '../model/image-upload-folder.entity';
import { RequestContextService } from '../modules/request-context/request-context.service';
import { MailService } from '../mail/mail.service';
import { CustomerPublicService } from '../modules/customer-public/customer-public.service';
import { AuthService } from './auth.service';
import { UserService } from '../modules/user/user.service';
import { ImageUploadModule } from '../modules/image-upload/image-upload.module';
import { UserAddressModule } from '@/modules/user-address/user-address.module';
import { UserIdentityDocument } from '@/model/user-identity-document.entity';
import { CisModule } from '@/modules/cis/cis.module';
import { AuthCenterService } from '../modules/auth-center/auth-center.service';
import { UserMerchantModule } from '../modules/user-merchant/user-merchant.module';
import { UserOrganizationModule } from '@/modules/user-organization/user-organization.module';
import { OrganizationModule } from '@/modules/organization/organization.module';
import { OrganizationContactModule } from '@/modules/organization-contact/organization-contact.module';
import { Organization } from '@/model/organization.entity';
import { DraftUser } from '@/model/draft-user.entity';
import { DraftUserAddress } from '@/model/draft-user-address.entity';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Module({
  imports: [
    HttpModule,
    UserModule,
    PassportModule,
    UserAddressModule,
    CisModule,
    UserMerchantModule,
    UserOrganizationModule,
    OrganizationModule,
    OrganizationContactModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Merchant,
      Customer,
      CustomerAddress,
      Cart,
      ImageUpload,
      ImageUploadFolder,
      UserIdentityDocument,
      Organization,
      DraftUser,
      DraftUserAddress,
    ]),
    ImageUploadModule,
    BullModule.registerQueue({
      name: 'user-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'user-consumer',
      adapter: BullAdapter,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    CustomerPublicService,
    RequestContextService,
    MailService,
    AuthCenterService,
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
    {
      provide: 'APP_ID_BUYER',
      useFactory: (configService: ConfigService) =>
        configService.get('APP_ID_BUYER'),
      inject: [ConfigService],
    },
    {
      provide: 'APP_ID_MARKETPLACE',
      useFactory: (configService: ConfigService) =>
        configService.get('APP_ID_MARKETPLACE'),
      inject: [ConfigService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
