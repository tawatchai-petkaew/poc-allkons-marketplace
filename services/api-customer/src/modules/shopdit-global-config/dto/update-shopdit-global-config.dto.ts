import { IsNotEmpty, IsOptional } from 'class-validator';

import {
  CreateMerchantType,
  RegisterAdminType,
  ShopditGlobalConfig
} from '../../../model/shopdit-global-config.entity';
import { ShopditGlobalConfigDto } from './shopdit-global-config.dto';

export class UpdateShopditGlobalConfigDto
  implements Readonly<UpdateShopditGlobalConfigDto> {
  @IsOptional()
  registerAdminType: RegisterAdminType;

  @IsOptional()
  createMerchantType: CreateMerchantType;

  @IsOptional()
  enableFlashsalePortal: boolean;

  @IsOptional()
  skipVerifyAdminEmail: boolean;

  public static from(dto: Partial<ShopditGlobalConfigDto>) {
    const it = new ShopditGlobalConfig();
    it.id = dto.id;
    it.registerAdminType = dto.registerAdminType;
    it.createMerchantType = dto.createMerchantType;
    it.enableFlashsalePortal = dto.enableFlashsalePortal;
    it.skipVerifyAdminEmail = dto.skipVerifyAdminEmail;

    return {
      ...it
    };
  }

  public static fromEntity(entity: ShopditGlobalConfig) {
    return this.from({
      id: entity.id,
      registerAdminType: entity.registerAdminType,
      createMerchantType: entity.createMerchantType,
      enableFlashsalePortal: entity.enableFlashsalePortal,
      skipVerifyAdminEmail: entity.skipVerifyAdminEmail
    });
  }

  public static toEntity(dto: Partial<UpdateShopditGlobalConfigDto>) {
    const it = new ShopditGlobalConfig();
    it.registerAdminType = dto.registerAdminType;
    it.createMerchantType = dto.createMerchantType;
    it.enableFlashsalePortal = dto.enableFlashsalePortal;
    it.skipVerifyAdminEmail = dto.skipVerifyAdminEmail;

    return it;
  }
}
