import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MerchantCategory } from '../../model/merchant-category.entity';
import { CreateMerchantCategoryDto } from './dto/create-merchant-category.dto';
import { MerchantCategoryDto } from './dto/merchant-category.dto';
import { UpdateMerchantCategoryDto } from './dto/update-merchant-category.dto';

@Injectable()
export class MerchantCategoryService {
  constructor(
    @InjectRepository(MerchantCategory)
    private readonly merchantCategoryRepo: Repository<MerchantCategory>
  ) {}

  public async create(dto: CreateMerchantCategoryDto) {
    return this.merchantCategoryRepo
      .save(CreateMerchantCategoryDto.toEntity(dto))
      .then(async (e) => {
        return MerchantCategoryDto.fromEntity(e);
      });
  }

  public async showAll(): Promise<MerchantCategoryDto[]> {
    const merchantCategories = await this.merchantCategoryRepo.find();

    return merchantCategories.map((e) => MerchantCategoryDto.fromEntity(e));
  }

  public async findById(id): Promise<MerchantCategory> {
    const merchantCategory = await this.merchantCategoryRepo.findOne(id);

    return merchantCategory;
  }

  public async update(
    id: number,
    dto: UpdateMerchantCategoryDto
  ): Promise<MerchantCategoryDto> {
    const merchantCategory = await this.merchantCategoryRepo.findOne(id);

    const merchantCategoryEntity = UpdateMerchantCategoryDto.toEntity(dto);

    return this.merchantCategoryRepo.save(
      Object.assign(merchantCategory, merchantCategoryEntity)
    );
  }

  public async delete(id: number) {
    return this.merchantCategoryRepo.softDelete(id);
  }
}
