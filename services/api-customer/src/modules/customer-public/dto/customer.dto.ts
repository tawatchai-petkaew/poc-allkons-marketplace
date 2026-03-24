import { IsNotEmpty, IsOptional } from 'class-validator';
import { Customer } from '../../../model/customer.entity';
import { CustomerAddress } from '../../../model/customer-address.entity';
import { Merchant } from '../../../model/merchant.entity';
import { User } from '../../../model/user.entity';
import { Order } from '../../../model/order.entity';
import { Cart } from '../../../model/cart.entity';
import { UserGender } from '../../../model/enum/user.enum';
import { ImageUpload } from '../../../model/image-upload.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
}

export class CustomerDto implements Readonly<CustomerDto> {
  @IsNotEmpty()
  id: number;

  @IsOptional()
  registrationToken: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  countryCode: string;

  @IsNotEmpty()
  tel: string;

  @IsOptional()
  email: string;

  @IsOptional()
  customerLifeTimeValue: number;

  @IsOptional()
  countOrderList: number;

  @IsOptional()
  lastedOrder: Order;

  @IsOptional()
  isHavePassword: boolean;

  @IsOptional()
  tag: string[];

  @IsOptional()
  notation: string;

  @IsNotEmpty()
  status: CustomerStatus;

  @IsOptional()
  gender: UserGender;

  @IsOptional()
  birthDate: Date;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  customerAddresses: CustomerAddress[];

  @IsNotEmpty()
  user: User;

  @IsOptional()
  orders: Order[];

  @IsOptional()
  cart: Cart;

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
    it.orders = dto.orders;
    it.customerAddresses = dto.customerAddresses;
    it.user = dto.user;
    it.cart = dto.cart;

    return {
      ...it,
      customerLifeTimeValue: dto?.customerLifeTimeValue,
      countOrderList: dto?.countOrderList,
      lastedOrder: dto?.lastedOrder,
      isHavePassword: dto?.isHavePassword,
    };
  }

  public static fromEntity(entity: Customer, optional) {
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
      orders: entity.orders,
      customerAddresses: entity.customerAddresses,
      cart: entity.cart,
      user: entity.user,
      customerLifeTimeValue: optional?.customerLifeTimeValue,
      countOrderList: optional?.countOrderList,
      lastedOrder: optional?.lastedOrder,
      isHavePassword:
        entity.user?.password !== null && entity.user?.password !== undefined,
    });
  }
}
