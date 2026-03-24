import { IsOptional } from 'class-validator';
import { Customer } from '../../../model/customer.entity';
import { CustomerAddress } from '../../../model/customer-address.entity';
import { Merchant } from '../../../model/merchant.entity';
import { User } from '../../../model/user.entity';
import { CustomerDto } from './customer.dto';
import { CustomerAddressDto } from './customer-address.dto';
import { UserGender } from '../../../model/enum/user.enum';
import { ImageUpload } from '../../../model/image-upload.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
}

export class UpdateCustomerDto implements Readonly<UpdateCustomerDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  fullName: string;

  @IsOptional()
  currentDeviceToken: string;

  @IsOptional()
  registrationToken: string;

  @IsOptional()
  countryCode: string;

  @IsOptional()
  tel: string;

  @IsOptional()
  gender: UserGender;

  @IsOptional()
  birthDate: Date;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  email: string;

  @IsOptional()
  tag: string[];

  @IsOptional()
  notation: string;

  @IsOptional()
  status: CustomerStatus;

  @IsOptional()
  customerAddresses: CustomerAddress[];

  @IsOptional()
  customerAddressAttributes: CustomerAddressDto[];

  @IsOptional()
  user: User;

  @IsOptional()
  merchant: Merchant;

  public static from(dto: Partial<CustomerDto>) {
    const it = new Customer();
    it.id = dto.id;
    it.registrationToken = dto.registrationToken;
    it.fullName = dto.fullName;
    it.countryCode = dto.countryCode;
    it.tel = dto.tel;
    it.email = dto.email;
    it.tag = dto.tag;
    it.notation = dto.notation;
    it.status = dto.status;
    it.gender = dto.gender;
    it.birthDate = dto.birthDate;
    it.imageUpload = dto.imageUpload;
    it.customerAddresses = dto.customerAddresses;
    it.user = dto.user;

    return it;
  }

  public static fromEntity(entity: Customer) {
    return this.from({
      id: entity.id,
      registrationToken: entity.registrationToken,
      fullName: entity.fullName,
      countryCode: entity.countryCode,
      tel: entity.tel,
      email: entity.email,
      tag: entity.tag,
      notation: entity.notation,
      status: entity.status,
      gender: entity.gender,
      birthDate: entity.birthDate,
      imageUpload: entity.imageUpload,
      customerAddresses: entity.customerAddresses,
      user: entity.user,
    });
  }

  public static toEntity(dto: Partial<UpdateCustomerDto>) {
    const it = new Customer();
    it.currentDeviceToken = dto.currentDeviceToken;
    it.registrationToken = dto.registrationToken;
    it.fullName = dto.fullName;
    it.countryCode = dto.countryCode;
    it.tel = dto.tel;
    it.email = dto.email;
    it.tag = dto.tag;
    it.notation = dto.notation;
    it.status = dto.status;
    it.gender = dto.gender;
    it.birthDate = dto.birthDate;
    it.imageUpload = dto.imageUpload;
    it.customerAddresses = dto.customerAddresses;
    it.user = dto.user;

    return it;
  }
}
