import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaginationType } from '../../types/pagination.type';
import { ProductMatchingInterface } from './interfaces/product-matching.interface';
import {
  ProductMatchingSuggestionRequest,
  ProductMatchingSuggestionResponse,
} from './interfaces/product-matching.interface';

@Injectable()
export class ProductMatchingService {
  private readonly baseUrl =
    process.env.PRODUCT_MATCHING_API_URL ||
    'https://product-matching-dev.allkons.com/api/v1';
  private readonly apiKey =
    process.env.PRODUCT_MATCHING_API_KEY ||
    'k1AFu-4ZnYR7TzlKwRI9h-TSSaJ6DntdZ9rAG2JQOhY';

  private readonly logger = new Logger(ProductMatchingService.name);

  constructor(private readonly httpService: HttpService) {}

  async searchProducts(params: {
    offset?: number;
    limit?: number;
    filter?: string;
    search: string;
  }): Promise<PaginationType<ProductMatchingInterface>> {
    const { offset = 0, limit = 10, filter = 'all', search } = params;

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/product/search`, {
          params: {
            offset,
            limit,
            filter,
            search,
          },
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }),
      );

      const { pagination, products } = response.data;

      // Calculate page number from offset and limit
      const page = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(pagination.total / limit);

      return {
        meta: {
          page,
          pageLimit: limit,
          totalItems: pagination.total,
          totalPages,
        },
        items: products,
      };
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  /**
   * Get product suggestions from External Matching API
   * Supports batch matching multiple products at once
   */
  async getSuggestions(
    requests: ProductMatchingSuggestionRequest[],
    params?: {
      offset?: number;
      limit?: number;
    },
  ): Promise<ProductMatchingSuggestionResponse[]> {
    const { offset = 0, limit = 10 } = params || {};

    this.logger.log(
      `Getting suggestions for ${requests.length} products from External API...`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<ProductMatchingSuggestionResponse[]>(
          `${this.baseUrl}/product/suggestions`,
          requests,
          {
            params: {
              offset,
              limit,
            },
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        `External API returned ${response.data.length} suggestion results`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get product suggestions: ${error.message}`);
      throw new Error(`Failed to get product suggestions: ${error.message}`);
    }
  }
}
