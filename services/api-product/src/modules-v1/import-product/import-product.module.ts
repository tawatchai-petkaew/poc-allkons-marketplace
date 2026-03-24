import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { RequestContextModule } from '@/modules/request-context/request-context.module';
import { ImportProductController } from './import-product.controller';
import { ImportProductService } from './import-product.service';
import { ImportProductBatchService } from './service/import-product-batch.service';
import { Product } from '@/model/product.entity';
import { MerchantProduct } from '@/model/merchant-product.entity';
import { ProductVariant } from '@/model/product-variant.entity';
import { ImportProductBatch } from '@/model/import-product-batch.entity';
import { ImportProductItem } from '@/model/import-product-item.entity';
import { ExcelParserService } from '@/common/service/excel-parser.service';
import { ProductExcelRowProcessorService } from './service/product-excel-row-processor.service';
import { ImportProductValidatorService } from './service/import-product-validator.service';
import { ProductDuplicateDetectionService } from './service/product-duplicate-detection.service';
import { ResultCalculatorService } from './service/result-calculator.service';
import { ProductMatchingAdapterService } from './service/product-matching-adapter.service';
import { S3Module } from '../s3/s3.module';
import { ProductMatchingModule } from '../product-matching/product-matching.module';
import { ProductMatchingConsumer } from './consumer/product-matching.consumer';
import { ProductImportConsumer } from './consumer/product-import.consumer';
import { BatchStatusEventService } from './service/batch-status-event.service';
import { ImportMerchantProductService } from './service/import-merchant-product.service';
import { MasterSkuService } from './service/master-sku.service';
import { ExportMatchingResultService } from './service/export-matching-result.service';
import { Merchant } from '@/model/merchant.entity';

@Module({
  imports: [
    RequestContextModule,
    S3Module,
    ProductMatchingModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    BullModule.registerQueue(
      {
        name: 'product-matching-queue',
        defaultJobOptions: {
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5s, then 10s, 20s
          },
          removeOnComplete: 10, // Clean up completed jobs
          removeOnFail: 10, // Keep failed jobs for debugging
        },
      },
      {
        name: 'product-import-queue',
        defaultJobOptions: {
          attempts: 3, // 1 initial attempt + 2 retries = 3 total attempts
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5s, then 10s, 20s
          },
          removeOnComplete: 10, // Clean up completed jobs
          removeOnFail: 10, // Keep failed jobs for debugging
        },
      },
    ),
    TypeOrmModule.forFeature([
      Product,
      MerchantProduct,
      ProductVariant,
      ImportProductBatch,
      ImportProductItem,
      Merchant,
    ]),
  ],
  controllers: [ImportProductController],
  providers: [
    ImportProductService,
    ImportProductBatchService,
    ExcelParserService,
    ProductExcelRowProcessorService,
    ImportProductValidatorService,
    ProductDuplicateDetectionService,
    ResultCalculatorService,
    ProductMatchingAdapterService,
    ProductMatchingConsumer,
    ProductImportConsumer,
    BatchStatusEventService,
    ImportMerchantProductService,
    MasterSkuService,
    ExportMatchingResultService,
  ],
  exports: [
    ImportProductService,
    ImportProductBatchService,
    ImportMerchantProductService,
    MasterSkuService,
  ],
})
export class ImportProductModule {}
