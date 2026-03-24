import { IsNotEmpty, IsOptional } from 'class-validator';
import { Customer } from '../../../model/customer.entity';
import { Merchant } from '../../../model/merchant.entity';
import { User } from '../../../model/user.entity';
import { CustomerDto } from './customer.dto';

export enum CustomerStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
}

export class CreateCustomerDto implements Readonly<CreateCustomerDto> {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  pin: string;

  @IsNotEmpty()
  countryCode: string;

  @IsNotEmpty()
  tel: string;

  @IsOptional()
  email: string;

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
      customerAddresses: entity.customerAddresses,
      user: entity.user,
    });
  }

  public static toEntity(dto: Partial<CreateCustomerDto>) {
    const it = new Customer();
    it.countryCode = dto.countryCode;
    it.tel = dto.tel;
    it.email = dto.email;
    it.user = dto.user;

    return it;
  }
}
