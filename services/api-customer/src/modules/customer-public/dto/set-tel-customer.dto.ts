import { IsNotEmpty, IsOptional } from 'class-validator';
import { Customer } from '../../../model/customer.entity';
import { User } from '../../../model/user.entity';
import { CustomerDto } from './customer.dto';

export class SetTelCustomerDto implements Readonly<SetTelCustomerDto> {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  pin: string;

  @IsNotEmpty()
  countryCode: string;

  @IsNotEmpty()
  tel: string;

  @IsOptional()
  user: User;

  public static from(dto: Partial<CustomerDto>) {
    const it = new Customer();
    it.id = dto.id;
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

  public static toEntity(dto: Partial<SetTelCustomerDto>) {
    const it = new Customer();
    it.countryCode = dto.countryCode;
    it.tel = dto.tel;
    it.user = dto.user;

    return it;
  }
}
