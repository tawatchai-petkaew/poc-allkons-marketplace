import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShopditGlobalConfig } from '../../model/shopdit-global-config.entity';

import { CreateShopditGlobalConfigDto } from './dto/create-shopdit-global-config.dto';
import { ShopditGlobalConfigDto } from './dto/shopdit-global-config.dto';
import { UpdateShopditGlobalConfigDto } from './dto/update-shopdit-global-config.dto';

@Injectable()
export class ShopditGlobalConfigService {
  constructor(
    @InjectRepository(ShopditGlobalConfig)
    private readonly shopditGlobalConfigRepo: Repository<ShopditGlobalConfig>
  ) {}

  public async get(): Promise<any> {
    const shopditGlobalConfig = await this.shopditGlobalConfigRepo.findOne();

    return shopditGlobalConfig
      ? ShopditGlobalConfigDto.fromEntity(shopditGlobalConfig)
      : null;
  }

  public async createOrUpdate(dto: any) {
    const shopditGlobalConfig = await this.shopditGlobalConfigRepo.findOne();

    if (shopditGlobalConfig) {
      const updateDto = {
        ...dto
      };

      const shopditGlobalConfigEntity = UpdateShopditGlobalConfigDto.toEntity(
        updateDto
      );

      return await this.shopditGlobalConfigRepo.save({
        ...shopditGlobalConfig,
        ...shopditGlobalConfigEntity
      });
    } else {
      const createDto = {
        ...dto
      };

      return await this.shopditGlobalConfigRepo.save(
        CreateShopditGlobalConfigDto.toEntity(createDto)
      );
    }
  }
}
