import { IsOptional } from 'class-validator';
import { Customer } from '../../../model/customer.entity';
import { CustomerAddress } from '../../../model/customer-address.entity';

export class CustomerAddressDto implements Readonly<CustomerAddressDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  tel: string;

  @IsOptional()
  name: string;

  @IsOptional()
  fullName: string;

  @IsOptional()
  email: string;

  @IsOptional()
  address: string;

  @IsOptional()
  postCodeAddress: string;

  @IsOptional()
  provinceAddress: string;

  @IsOptional()
  districtAddress: string;

  @IsOptional()
  subdistrictAddress: string;

  @IsOptional()
  customer: Customer;

  public static from(dto: Partial<CustomerAddressDto>) {
    const it = new CustomerAddress();
    it.id = dto.id;
    it.name = dto.name;
    it.fullName = dto.fullName;
    it.tel = dto.tel;
    it.email = dto.email;
    it.address = dto.address;
    it.postCodeAddress = dto.postCodeAddress;
    it.provinceAddress = dto.provinceAddress;
    it.districtAddress = dto.districtAddress;
    it.subdistrictAddress = dto.subdistrictAddress;
    it.customer = dto.customer;

    return it;
  }

  public static fromEntity(entity: CustomerAddress): CustomerAddressDto {
    return this.from({
      id: entity.id,
      name: entity.name,
      fullName: entity.fullName,
      tel: entity.tel,
      email: entity.email,
      address: entity.address,
      postCodeAddress: entity.postCodeAddress,
      provinceAddress: entity.provinceAddress,
      districtAddress: entity.districtAddress,
      subdistrictAddress: entity.subdistrictAddress,
      customer: entity.customer
    });
  }

  public static toEntity(dto: Partial<CustomerAddressDto>) {
    const it = new CustomerAddress();
    it.name = dto.name;
    it.fullName = dto.fullName;
    it.email = dto.email;
    it.tel = dto.tel;
    it.address = dto.address;
    it.postCodeAddress = dto.postCodeAddress;
    it.provinceAddress = dto.provinceAddress;
    it.districtAddress = dto.districtAddress;
    it.subdistrictAddress = dto.subdistrictAddress;
    it.customer = dto.customer;

    return it;
  }
}
