import { Module } from '@nestjs/common';
import { BigqueryService } from './bigquery.service';
import { BigqueryController } from './bigquery.controller';
import { RetailApiService } from './retail-api/retail-api.service';
import { RetailApiController } from './retail-api/retail-api.controller';
@Module({
  providers: [BigqueryService, RetailApiService],
  controllers: [BigqueryController, RetailApiController],
  exports: [BigqueryService, RetailApiService]
})
export class BigqueryModule {}
