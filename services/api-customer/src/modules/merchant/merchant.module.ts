import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';

import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { MerchantCategory } from '../../model/merchant-category.entity';
import { MerchantIcon } from '../../model/merchant-icon.entity';
import { MerchantLogo } from '../../model/merchant-logo.entity';
import { MerchantPdpa } from '../../model/merchant-pdpa.entity';
import { MerchantTranslation } from '../../model/merchant-translation.entity';
import { Merchant } from '../../model/merchant.entity';
import { Product } from '../../model/product.entity';
import { User } from '../../model/user.entity';

import { AuthModule } from '@/auth/auth.module';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { MerchantShipment } from '@/model/merchant-shipment.entity';
import { Order } from '@/model/order.entity';
import { Organization } from '@/model/organization.entity';
import { Store } from '@/model/store.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Article } from '../../model/article.entity';
import { MerchantTaxInvoiceItem } from '../../model/merchant-tax-invoice-item.entity';
import { MerchantTaxInvoice } from '../../model/merchant-tax-invoice.entity';
import { CisModule } from '../cis/cis.module';
import { MerchantPublicModule } from '../merchant-public/merchant-public.module';
import { PermissionModule } from '../permission/permission.module';
import { RequestContextModule } from '../request-context/request-context.module';
import { RoleModule } from '../role/role.module';
import { StoreModule } from '../store/store.module';
import { UserMerchantModule } from '../user-merchant/user-merchant.module';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { UserModule } from '../user/user.module';
import { OpenApiMerchantController } from './open-api/open-api-merchant.controller';
import { OpenApiMerchantService } from './open-api/open-api-merchant.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-expense-bill-queue',
    }),
    BullModule.registerQueue({
      name: 'demo-merchant',
    }),
    BullBoardModule.forFeature({
      name: 'create-expense-bill-queue',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'demo-merchant',
      adapter: BullAdapter,
    }),
    TypeOrmModule.forFeature([
      Merchant,
      MerchantTranslation,
      MerchantCategory,
      ImageUploadFolder,
      MerchantLogo,
      MerchantIcon,
      ImageUpload,
      User,
      MerchantPdpa,
      Product,
      Article,
      MerchantTaxInvoice,
      MerchantTaxInvoiceItem,
      MerchantShipment,
      UserOrganization,
      Organization,
      Order,
      Store,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    RequestContextModule,
    forwardRef(() => AuthModule),
    UserOrganizationModule,
    forwardRef(() => UserMerchantModule),
    RoleModule,
    CisModule,
    ConfigModule,
    forwardRef(() => UserModule),
    PermissionModule,
    MerchantPublicModule,
    StoreModule,
  ],
  providers: [
    MerchantService,
    OpenApiMerchantService,
    OrganizationPermissionGuard,
  ],
  exports: [MerchantService, OpenApiMerchantService],
  controllers: [MerchantController, OpenApiMerchantController],
})
export class MerchantModule {}
