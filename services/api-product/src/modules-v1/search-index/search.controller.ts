import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ElasticsearchService,
  SearchProductRequestDto,
  SearchProductResponseDto,
} from './indices/merchant-product';
import { AutocompleteResponseDto } from './dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete/Suggestion for products' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filter by merchant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns autocomplete suggestions',
    type: [AutocompleteResponseDto],
  })
  async autocomplete(
    @Query('q') query: string,
    @Query('merchantId') merchantId?: string,
  ) {
    if (!query || query.length < 2) {
      return [];
    }
    const parsedMerchantId = merchantId ? parseInt(merchantId, 10) : undefined;
    return this.elasticsearchService.autocomplete(query, parsedMerchantId);
  }

  @Post('products/search')
  @ApiOperation({ summary: 'Search products with filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns search results with pagination',
    type: SearchProductResponseDto,
  })
  async search(@Body() query: SearchProductRequestDto) {
    return this.elasticsearchService.search(query);
  }
}
