import {
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  UseGuards,
  HttpException,
  Param,
  Query,
  Sse,
  MessageEvent,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiExcludeEndpoint,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Observable, interval } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';
import { ImportProductService } from './import-product.service';
import { ImportProductBatchService } from './service/import-product-batch.service';
import { ExtractExcelResponseDto } from './dto/extract-excel-response.dto';
import { ListBatchesQueryDto } from './dto/list-batches.dto';
import { HttpExceptionFilter, ErrorHandler } from 'allkons-api-helper';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { Merchant } from '@/model';
import { MerchantGuard } from '@/guard/merchant.guard';
import { CurrentMerchant, CurrentUser } from '@/decorators/request.decorator';
import { AuthUser } from '@/types/request.types';
import { SetTimeout } from '@/decorators/set-timeout.decorator';
import { ListBatchItemsQueryDto } from './dto/list-batch-items.dto';
import {
  MatchingSimilarItemsDto,
  MatchingSimilarItemsResponseDto,
} from './dto/matching-similar-items.dto';
import { MasterSkuSuggestProductRequestDto } from './dto/master-sku-webhook.dto';
import { BatchStatusEventService } from './service/batch-status-event.service';
import { MasterSkuService } from './service/master-sku.service';
import { ExportMatchingResultService } from './service/export-matching-result.service';

@Controller('v1/import-product')
@ApiTags('Import Product')
export class ImportProductController {
  constructor(
    private readonly importProductService: ImportProductService,
    private readonly batchService: ImportProductBatchService,
    private readonly eventService: BatchStatusEventService,
    private readonly masterSkuService: MasterSkuService,
    private readonly exportService: ExportMatchingResultService,
  ) {}

  @ApiOperation({
    operationId: 'extractProductDataFromExcel',
    description: 'Extract product data from Excel file and store to S3',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: 'Success',
    type: ExtractExcelResponseDto,
  })
  @SetTimeout(120000) // 2 minutes timeout
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Post('/extract-excel')
  async extractExcel(
    @CurrentUser() user: AuthUser,
    @CurrentMerchant() merchant: Merchant,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (!file) {
        ErrorHandler.handleBadRequestError('กรุณาแนบไฟล์ Excel');
      }

      return await this.importProductService.importAndValidateProductsExcel(
        file,
        merchant.id,
        user.id,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to extract Excel data');
    }
  }

  @ApiOperation({
    operationId: 'listImportBatches',
    description: 'Get list of import batches with pagination and filters',
  })
  @ApiOkResponse({
    description: 'List of import batches retrieved successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('/batches')
  async listBatches(
    @CurrentMerchant() merchant: Merchant,
    @Query() query: ListBatchesQueryDto,
  ) {
    try {
      return await this.batchService.listBatches(
        merchant.id,
        query.page,
        query.limit,
        query.search,
        query.status,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to list import batches');
    }
  }

  @ApiOperation({
    operationId: 'startProductMatching',
    description: 'Start matching products from validated import batch',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Matching started successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Post('/batches/:uuid/start-matching')
  async startMatching(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
    @CurrentUser() user: AuthUser,
  ) {
    try {
      return await this.batchService.startMatching(uuid, merchant.id, user.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to start matching');
    }
  }

  @ApiExcludeEndpoint()
  @Sse('/batches/:uuid/events')
  @UseGuards(ActJwtGuard, MerchantGuard)
  streamBatchEvents(@Param('uuid') uuid: string): Observable<MessageEvent> {
    // Stream real-time status updates for specific batch
    // UUID is globally unique, merchant verification handled by Guard
    return this.eventService.getEventStream().pipe(
      filter((event) => event.batchUuid === uuid),
      map((event) => ({
        data: event,
      })),
      // Auto-complete after 5 minutes of inactivity
      takeUntil(interval(300000)),
    );
  }

  @ApiOperation({
    operationId: 'listImportBatchItems',
    description: 'Get list of import batch items with pagination and filters',
  })
  @ApiOkResponse({
    description: 'List of import batch items retrieved successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('/batch/:uuid/items')
  async listBatchesItem(
    @CurrentMerchant() merchant: Merchant,
    @Param('uuid') uuid: string,
    @Query() query: ListBatchItemsQueryDto,
  ) {
    try {
      return await this.batchService.listBatchItems(
        uuid,
        merchant.id,
        query.page,
        query.limit,
        query.matchStatus,
        query.importStatus,
        query.search,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to list import batch items');
    }
  }

  @ApiOperation({
    operationId: 'getOriginalFile',
    description: 'Get presigned URL to download original import file',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Presigned URL retrieved successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('/batches/:uuid/original-file')
  async getOriginalFile(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
  ) {
    try {
      return await this.batchService.getOriginalFileUrl(uuid, merchant.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to get original file');
    }
  }

  @ApiOperation({
    operationId: 'cancelImportBatch',
    description:
      'Cancel import batch. Can only cancel batches in MATCHING status to stop background matching job.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Batch cancelled successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Post('/batches/:uuid/cancel')
  async cancelBatch(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
    @CurrentUser() user: AuthUser,
  ) {
    try {
      return await this.batchService.cancelBatch(uuid, merchant.id, user.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to cancel batch');
    }
  }

  @ApiOperation({
    operationId: 'completeImportBatch',
    description:
      'Manually complete import batch. Can only complete batches in PENDING_REVIEW status. Changes batch status to COMPLETED.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Batch completed successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Post('/batches/:uuid/complete')
  async completeBatch(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
    @CurrentUser() user: AuthUser,
  ) {
    try {
      return await this.batchService.completeBatch(uuid, merchant.id, user.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to complete batch');
    }
  }

  @ApiOperation({
    operationId: 'deleteImportBatch',
    description:
      'Delete import batch and all related data (items and S3 files)',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Batch deleted successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Delete('/batches/:uuid')
  async deleteBatch(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
  ) {
    try {
      return await this.batchService.deleteBatch(uuid, merchant.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to delete batch');
    }
  }

  @ApiOperation({
    operationId: 'cleanupImportBatch',
    description:
      'Cleanup import batch and delete S3 files. If batchUuid is provided, cleanup specific batch. Otherwise cleanup all VALIDATED batches.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID (optional)',
    type: 'string',
    required: false,
  })
  @ApiOkResponse({
    description: 'Cleanup completed successfully',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Delete('/batches/cleanup')
  async cleanupBatches(
    @CurrentMerchant() merchant: Merchant,
    @Query('batchUuid') batchUuid?: string,
  ) {
    try {
      return await this.batchService.cleanupBatch(merchant.id, batchUuid);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to cleanup batches');
    }
  }

  @ApiOperation({
    operationId: 'matchingSimilarItems',
    description:
      'Match SIMILAR/NOT_FOUND items. ' +
      'With productVariantId: Import the product. ' +
      'Without productVariantId: SIMILAR → send to admin, NOT_FOUND → reject.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiBody({ type: MatchingSimilarItemsDto })
  @ApiOkResponse({
    description: 'Items matched successfully',
    type: MatchingSimilarItemsResponseDto,
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  @Post('/batch/:uuid/items/matching-similar')
  async matchingSimilarItems(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
    @CurrentUser() user: AuthUser,
    @Body() body: MatchingSimilarItemsDto,
  ) {
    try {
      return await this.batchService.matchingSimilarItems(
        uuid,
        merchant.id,
        user.id,
        body.items,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to match similar items');
    }
  }

  @ApiOperation({
    operationId: 'receiveMasterSkuSuggestions',
    description:
      'Webhook endpoint for MASTER_SKU to send product suggestions or reject items. ' +
      'Send suggestions array with products to provide suggestions. ' +
      'Send suggestions=null to reject the item with an optional reason.',
  })
  @ApiBody({ type: MasterSkuSuggestProductRequestDto })
  @ApiOkResponse({
    description:
      'Suggestions/rejections processed successfully. Items with suggestions are marked as PENDING. Items with null suggestions are marked as REJECTED.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid API key' })
  @ApiBadRequestResponse({ description: 'Invalid batch or item status' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  // @UseGuards(MasterSkuApiKeyGuard)
  @Post('/batch/items/master-sku-suggestions')
  async receiveMasterSkuSuggestions(
    @Body() body: MasterSkuSuggestProductRequestDto,
  ) {
    try {
      const data = await this.masterSkuService.mockSuggestProductFromMasterSKU(
        body.items,
      );
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(
        error,
        'Failed to process MASTER_SKU suggestions',
      );
    }
  }

  @ApiOperation({
    operationId: 'exportMatchingResults',
    description:
      'Export product matching results to Excel file. Streams file directly without S3 storage. File includes 4 sheets: all items, matched items, similar suggestions, and not found items.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Import batch UUID',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Excel file with matching results streamed successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('/batch/:uuid/export')
  async exportMatchingResults(
    @Param('uuid') uuid: string,
    @CurrentMerchant() merchant: Merchant,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { file, filename } =
        await this.exportService.exportMatchingResultsToExcel(
          uuid,
          merchant.id,
        );

      // Set response headers for Excel download
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      });

      return file;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleHttpError(error, 'Failed to export matching results');
    }
  }
}
