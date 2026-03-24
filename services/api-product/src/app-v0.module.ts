import { Module } from '@nestjs/common';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { FlashSalePublicModule } from './modules/flash-sale-public/flash-sale-public.module';
import { ImageUploadFolderModule } from './modules/image-upload-folder/image-upload-folder.module';
import { ImageUploadModule } from './modules/image-upload/image-upload.module';
import { ProductCatalogPublicModule } from './modules/product-catalog-public/product-catalog-public.module';
import { ProductPublicModule } from './modules/product-public/product-public.module';
import { RequestContextModule } from './modules/request-context/request-context.module';
import { UserModule } from './modules/user/user.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserOrganizationModule } from './modules/user-organization/user-organization.module';

@Module({
  imports: [
    // Core
    RequestContextModule,
    UserModule,
    ImageUploadModule,
    ImageUploadFolderModule,
    FileUploadModule,
    ProductPublicModule,
    ProductCatalogPublicModule,
    FlashSalePublicModule,
    OrganizationModule,
    UserOrganizationModule,
  ],
})
export class AppV0Module {}
