import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ProductService } from './services/product.service';
import { ExportProductService } from './services/export-product.service';
import { ManageProductService } from './services/manage-product.service';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { AllExceptionsFilter, HttpExceptionFilter } from 'allkons-api-helper';
import {
  CheckDuplicateMerchantProductDto,
  MerchantProductValidationResult,
} from './dto/check-duplicate-merchant-product.dto';
import {
  CheckVariantExistenceDto,
  CheckVariantExistenceResponseDto,
} from './dto/check-variant-existence.dto';
import { AddMerchantProductDto } from './dto/merchant-product.dto';
import { MerchantProduct } from '@/model/merchant-product.entity';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { MerchantGuard } from '@/guard/merchant.guard';
import { CurrentMerchant, CurrentUser } from '@/decorators/request.decorator';
import { AuthUser, RequestMerchant } from '@/types/request.types';
import { GetBranchesListResponseDto } from './dto/get-branches-response.dto';
import {
  CheckPriceMerchantRequestDto,
  CheckPriceMerchantResponseDto,
} from './dto/check-price-merchant.dto';
import {
  UpdateMerchantProductRequestDto,
  UpdateMerchantProductResponseDto,
} from './dto/update-merchant-product.dto';
import { MerchantProductDetailResponseDto } from './dto/merchant-product-detail.dto';
import {
  UpdateMerchantProductImagesResponseDto,
  MAX_MERCHANT_IMAGES,
  MAX_FILE_SIZE,
} from './dto/merchant-product-images.dto';
import { ExportProductsFilterDto } from './dto/export-products.dto';
import {
  DeleteMerchantProductRequestDto,
  DeleteMerchantProductResponseDto,
} from './dto/delete-merchant-product.dto';
import { SetTimeout } from '@/decorators/set-timeout.decorator';
import { parseOrderField } from '@/utils/utils';

@ApiTags('Product V1')
@Controller('v1/product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly exportProductService: ExportProductService,
    private readonly manageProductService: ManageProductService,
  ) {}

  @Get('product-import')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async searchProductImport(
    @Query('search') search: string,
    @Query('page') page?: number,
    @Query('pageLimit') pageLimit?: number,
    @Query('filter') filter?: string,
  ) {
    return this.productService.getProductImport(
      search,
      page,
      pageLimit,
      filter,
    );
  }

  @Get('')
  @UseGuards(ActJwtGuard, MerchantGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiOperation({
    summary: 'Get Products with Search and Filter',
    description:
      'Search products by name, SKU, barcode, category, and product type',
  })
  async getProducts(
    @CurrentMerchant() merchant: RequestMerchant,
    @Query('page') page?: number,
    @Query('pageLimit') pageLimit?: number,
    @Query('search') search?: string,
    @Query('searchType') searchType?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('productTypeId') productTypeId?: number,
    @Query('merchantProductStatus') merchantProductStatus?: string,
    @Query('productVariantIds') productVariantIds?: string,
  ) {
    const merchantId = merchant?.id;

    // Convert categoryId to array of numbers
    let categoryIdArray: number[] = [];
    if (categoryIds) {
      categoryIdArray = categoryIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    // Convert productVariantIds to array of numbers
    let productVariantIdArray: number[] = [];
    if (productVariantIds) {
      productVariantIdArray = productVariantIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    return await this.productService.getProducts(
      merchantId,
      page,
      pageLimit,
      search,
      searchType,
      categoryIdArray,
      productTypeId,
      merchantProductStatus,
      productVariantIdArray,
    );
  }

  @Get('status-count')
  @UseGuards(ActJwtGuard, MerchantGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiOperation({
    summary: 'Get Product Count by Status',
    description:
      'Get count of products grouped by merchantProductStatus with optional search and filters',
  })
  async getProductStatusCount(
    @CurrentMerchant() merchant: RequestMerchant,
    @Query('search') search?: string,
    @Query('searchType') searchType?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('productTypeId') productTypeId?: number,
    @Query('productVariantIds') productVariantIds?: string,
  ) {
    const merchantId = merchant?.id;

    // Convert categoryIds to array of numbers
    let categoryIdArray: number[] = [];
    if (categoryIds) {
      categoryIdArray = categoryIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    // Convert productVariantIds to array of numbers
    let productVariantIdArray: number[] = [];
    if (productVariantIds) {
      productVariantIdArray = productVariantIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    return this.productService.getProductStatusCount(
      merchantId,
      search,
      searchType,
      categoryIdArray,
      productTypeId,
      productVariantIdArray,
    );
  }

  @Get('export')
  @SetTimeout(120000) // 2 minutes timeout
  @UseGuards(ActJwtGuard, MerchantGuard)
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    summary: 'Export Merchant Products to Excel',
    description:
      'Export all merchant products to Excel using the import template format. Supports same filters as product list.',
  })
  async exportProducts(
    @CurrentMerchant() merchant: RequestMerchant,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('searchType') searchType?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('productTypeId') productTypeId?: number,
    @Query('merchantProductStatus') merchantProductStatus?: string,
    @Query('priceType') priceType?: string,
  ) {
    const filters: ExportProductsFilterDto = {
      search,
      searchType,
      categoryIds,
      productTypeId,
      merchantProductStatus,
      priceType,
    };

    const streamableFile =
      await this.exportProductService.exportMerchantProductsToExcel(
        merchant.id,
        filters,
      );

    // Generate filename with merchant name and timestamp
    const filename = await this.exportProductService.generateExportFilename(
      merchant.id,
    );

    // RFC 5987 encoding for non-ASCII characters
    // filename="fallback.xlsx" for old browsers
    // filename*=UTF-8''encoded for modern browsers
    const encodedFilename = encodeURIComponent(filename);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="products_export.xlsx"; filename*=UTF-8''${encodedFilename}`,
    });

    streamableFile.getStream().pipe(res);
  }

  @ApiOperation({ summary: 'Check Duplicate Merchant Product' })
  @Post('check-duplicate-merchant-product')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard)
  async checkDuplicateMerchantProduct(
    @Body() body: CheckDuplicateMerchantProductDto,
  ): Promise<MerchantProductValidationResult[]> {
    return this.productService.validateMerchantProducts(body);
  }

  @ApiOperation({ summary: 'Add Merchant Products' })
  @Post('merchant-product')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  async addMerchantProducts(
    @Body() body: AddMerchantProductDto[],
  ): Promise<MerchantProduct[]> {
    return this.productService.addMerchantProducts(body);
  }

  @ApiOperation({
    summary: 'Get Product Images by Variant IDs',
    description:
      'Get oldest product image for each productVariantId (one image per variant)',
  })
  @Get('variant-images')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard)
  async getProductImagesByVariantIds(
    @Query('productVariantIds') productVariantIds: string,
  ) {
    const variantIdArray = productVariantIds
      ? productVariantIds
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : [];

    return this.productService.getProductImagesByVariantIds(variantIdArray);
  }

  @Get('merchant-product-detail/:productVariantId')
  @ApiOperation({
    summary: 'Get Merchant Product Detail',
    description:
      'Retrieve full merchant product detail by productVariantId. ' +
      'Executes a single optimised CTE query (< 2 s).',
  })
  @ApiOkResponse({ type: MerchantProductDetailResponseDto })
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  async getMerchantProductDetail(
    @CurrentMerchant() merchant: RequestMerchant,
    @Param('productVariantId') productVariantId: number,
  ): Promise<MerchantProductDetailResponseDto> {
    return await this.manageProductService.getMerchantProductDetail(
      merchant.id,
      +productVariantId,
    );
  }

  @Put('merchant-product-images/:productVariantId')
  @ApiOperation({
    summary: 'Upload / Replace Merchant Product Images',
    description:
      'Upload a cover image (1 max) and/or merchant gallery images (4 max). ' +
      'Uses S3 streaming upload + DB transaction with compensating S3 deletes on failure.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        useCustomCoverImage: { type: 'boolean', example: true },
        useCustomMerchantImage: { type: 'boolean', example: true },
        order: {
          oneOf: [
            {
              type: 'string',
              example: '1',
              description:
                'Order(s) 1–4 to KEEP; send multiple for multiple: order=1, order=4',
            },
            {
              type: 'array',
              items: { type: 'integer' },
              description: 'Order numbers (1–4) to keep',
            },
          ],
          description:
            'Slots (1–4) to preserve. Other slots are deleted; new images replace those slots. E.g. order=1&order=4 keeps 1 and 4, deletes 2 and 3, new images fill 2 and 3.',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Single cover image file (optional)',
        },
        'merchantImages[]': {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: `Gallery images (max ${MAX_MERCHANT_IMAGES})`,
        },
      },
    },
  })
  @ApiOkResponse({ type: UpdateMerchantProductImagesResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverImage', maxCount: 1 },
        { name: 'merchantImages', maxCount: MAX_MERCHANT_IMAGES },
      ],
      {
        limits: { fileSize: MAX_FILE_SIZE },
      },
    ),
  )
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  async updateMerchantProductImages(
    @CurrentMerchant() merchant: RequestMerchant,
    @Param('productVariantId') productVariantId: number,
    @UploadedFiles()
    files: {
      coverImage?: Express.Multer.File[];
      merchantImages?: Express.Multer.File[];
    },
    @Body('useCustomCoverImage') useCustomCoverImageRaw?: string,
    @Body('useCustomMerchantImage') useCustomMerchantImageRaw?: string,
    @Body('order') orderRaw?: string[],
    @Body('removeCoverImage') removeCoverImageRaw?: string,
  ): Promise<UpdateMerchantProductImagesResponseDto> {
    const keepOrderNumbers = parseOrderField(orderRaw);
    return this.manageProductService.updateMerchantProductImages(
      merchant?.id,
      +productVariantId,
      useCustomCoverImageRaw === 'true',
      useCustomMerchantImageRaw === 'true',
      files?.coverImage?.[0],
      files?.merchantImages,
      keepOrderNumbers,
      removeCoverImageRaw === 'true',
    );
  }

  @Get(':sku/branches')
  @ApiOperation({ summary: 'Get branches for product' })
  @ApiOkResponse({ type: GetBranchesListResponseDto })
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(AllExceptionsFilter)
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  @UseGuards(ActJwtGuard)
  async getBranches(
    @Param('sku') sku: string,
    @CurrentUser() user: AuthUser,
  ): Promise<GetBranchesListResponseDto> {
    return await this.productService.getBranches(sku, user);
  }

  @ApiOperation({
    summary: 'Check Product Variant IDs Existence',
    description: 'Check if product variant IDs exist in merchant products',
  })
  @ApiOkResponse({ type: CheckVariantExistenceResponseDto })
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  @Post('check-variant-existence')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  @HttpCode(200)
  async checkVariantExistence(
    @CurrentMerchant() merchant: RequestMerchant,
    @Body() body: CheckVariantExistenceDto,
  ): Promise<CheckVariantExistenceResponseDto> {
    return this.productService.checkVariantExistence(
      merchant.id,
      body.productVariantIds,
    );
  }

  @Post('check-head-office-prices')
  @ApiOperation({
    summary: 'Check Product Prices at Head Office',
    description:
      'Get pricing information from head office for given product variants. Returns empty items if current merchant is head office.',
  })
  @ApiOkResponse({ type: CheckPriceMerchantResponseDto })
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  async checkHeadOfficePrices(
    @CurrentMerchant() merchant: RequestMerchant,
    @Body() body: CheckPriceMerchantRequestDto,
  ): Promise<CheckPriceMerchantResponseDto> {
    return await this.manageProductService.checkHeadOfficePrices(
      merchant.id,
      body.productVariantIds,
    );
  }

  @Post('update-merchant-products')
  @ApiOperation({
    summary: 'Update Merchant Products',
    description:
      'Update multiple merchant products in a single optimized batch operation. Supports updating prices, dates, and product settings.',
  })
  @ApiOkResponse({ type: UpdateMerchantProductResponseDto })
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  async updateMerchantProducts(
    @CurrentMerchant() merchant: RequestMerchant,
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateMerchantProductRequestDto,
  ): Promise<UpdateMerchantProductResponseDto> {
    return await this.manageProductService.updateMerchantProducts(
      merchant?.id,
      body.products,
      user,
    );
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  @Post('items/batch-delete')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Batch Soft-Delete Merchant Products',
    description:
      'Soft-delete multiple merchant products via POST. If the merchant is a HEAD_OFFICE, deletion cascades to all branches in the same organization.',
  })
  @ApiOkResponse({ type: DeleteMerchantProductResponseDto })
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard, MerchantGuard)
  async batchDeleteMerchantProducts(
    @CurrentMerchant() merchant: RequestMerchant,
    @CurrentUser() user: AuthUser,
    @Body() body: DeleteMerchantProductRequestDto,
  ): Promise<DeleteMerchantProductResponseDto> {
    return await this.manageProductService.deleteMerchantProducts(
      merchant.id,
      body.productVariantIds,
      user?.sub ?? user?.id?.toString() ?? 'system',
    );
  }
}
