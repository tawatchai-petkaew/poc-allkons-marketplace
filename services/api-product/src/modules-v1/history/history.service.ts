import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { HttpException } from '@nestjs/common';
import { AuthUser } from '@/types/request.types';
import {
  HistorySearchProductResponseDto,
  addHistorySearchProductDto,
  deleteHistorySearchProductByIdDto,
} from './dto/historySearchProduct.dto';
import { Repository } from 'typeorm';
import { HistorySearchProduct } from '@/model/history-search-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorHandler } from 'allkons-api-helper';

@Injectable()
export class HistorySearchProductService {
  constructor(
    @InjectRepository(HistorySearchProduct)
    private readonly historySearchProductRepo: Repository<HistorySearchProduct>,
  ) {}

  // SearchProduct
  async getHistorySearchProduct(
    user: AuthUser,
  ): Promise<HistorySearchProductResponseDto[]> {
    try {
      const histories = await this.historySearchProductRepo.find({
        where: {
          user: { id: user.id },
        },
        order: {
          updatedAt: 'DESC',
        },
      });
      return histories.map((history) => ({
        id: history.id,
        keyword: history.keyword,
        type: history.type,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      }));
    } catch (error) {
      ErrorHandler.handleHttpError(
        error,
        'Failed to get history search products',
      );
    }
  }
  async postHistorySearchProduct(
    user: AuthUser,
    body: addHistorySearchProductDto,
  ): Promise<HistorySearchProductResponseDto> {
    try {
      // Check if record already exists
      const existingHistory = await this.historySearchProductRepo.findOne({
        where: {
          keyword: body.keyword,
          type: body.type,
          user: { id: user.id },
        },
      });

      let savedHistory: HistorySearchProduct;

      if (existingHistory) {
        // Update existing record (this will automatically update updatedAt)
        existingHistory.updatedAt = new Date();
        savedHistory =
          await this.historySearchProductRepo.save(existingHistory);
      } else {
        // Create new search history record
        const newHistory = this.historySearchProductRepo.create({
          keyword: body.keyword,
          type: body.type,
          user: { id: user.id } as any,
        });
        savedHistory = await this.historySearchProductRepo.save(newHistory);

        // Check if user has more than 10 history records
        const userHistoryCount = await this.historySearchProductRepo.count({
          where: { user: { id: user.id } },
        });

        if (userHistoryCount > 10) {
          // Get the oldest record to delete
          const oldestRecord = await this.historySearchProductRepo.findOne({
            where: { user: { id: user.id } },
            order: { updatedAt: 'ASC' },
          });

          if (oldestRecord) {
            await this.historySearchProductRepo.remove(oldestRecord);
          }
        }
      }

      return {
        id: savedHistory.id,
        keyword: savedHistory.keyword,
        type: savedHistory.type,
        createdAt: savedHistory.createdAt,
        updatedAt: savedHistory.updatedAt,
      };
    } catch (error) {
      ErrorHandler.handleHttpError(
        error,
        'Failed to add history search product',
      );
    }
  }
  async deleteHistorySearchProductById(
    user: AuthUser,
    body: deleteHistorySearchProductByIdDto,
  ): Promise<{ data: string }> {
    try {
      const history = await this.historySearchProductRepo.findOne({
        where: {
          id: body.id,
          user: { id: user.id },
        },
      });

      if (!history) {
        throw new HttpException(
          {
            error: {
              code: ErrorCode.NOT_FOUND,
              message: 'History search product not found',
            },
          },
          404,
        );
      }

      await this.historySearchProductRepo.remove(history);
      return { data: 'Success' };
    } catch (error) {
      ErrorHandler.handleHttpError(
        error,
        'Failed to delete history search product by id',
      );
    }
  }
  async deleteHistorySearchAllProductById(
    user: AuthUser,
  ): Promise<{ data: string }> {
    try {
      // Delete all history records for this user
      await this.historySearchProductRepo.delete({
        user: { id: user.id },
      });

      return { data: 'Success' };
    } catch (error) {
      ErrorHandler.handleHttpError(
        error,
        'Failed to delete all history search products',
      );
    }
  }
}
