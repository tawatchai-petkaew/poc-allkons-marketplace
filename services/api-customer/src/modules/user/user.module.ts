import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { MailModule } from '../../mail/mail.module';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { UserAddressModule } from '../user-address/user-address.module';

import { User } from '../../model/user.entity';
import { Merchant } from '../../model/merchant.entity';
import { Customer } from '../../model/customer.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { UserIdentityDocument } from '../../model/user-identity-document.entity';
import { CisModule } from '../cis/cis.module';
import { UserMerchantModule } from '../user-merchant/user-merchant.module';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { OrganizationModule } from '../organization/organization.module';
import { AuthCenterModule } from '../auth-center/auth-center.module';
import { OrganizationContactModule } from '../organization-contact/organization-contact.module';
import { DraftUser } from '@/model/draft-user.entity';
import { DraftUserAddress } from '@/model/draft-user-address.entity';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { UserConsumer } from './user.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Merchant,
      Customer,
      ImageUpload,
      UserIdentityDocument,
      DraftUser,
      DraftUserAddress,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    MailModule,
    ImageUploadModule,
    UserAddressModule,
    CisModule,
    UserMerchantModule,
    UserOrganizationModule,
    forwardRef(() => OrganizationModule),
    AuthCenterModule,
    OrganizationContactModule,
    BullModule.registerQueue({
      name: 'user-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'user-consumer',
      adapter: BullAdapter,
    }),
    ConfigModule,
  ],
  providers: [UserService, UserConsumer],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
