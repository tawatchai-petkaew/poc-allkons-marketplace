import { IsNotEmpty, IsOptional } from 'class-validator';
import { Customer } from '../../../model/customer.entity';
import { CustomerAddress } from '../../../model/customer-address.entity';
import { Merchant } from '../../../model/merchant.entity';
import { User } from '../../../model/user.entity';
import { Order } from '../../../model/order.entity';
import { Cart } from '../../../model/cart.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
}

export class CustomerDto implements Readonly<CustomerDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  countryCode: string;

  @IsNotEmpty()
  tel: string;

  @IsOptional()
  email: string;

  @IsOptional()
  orderValue: number;

  @IsOptional()
  customerLifeTimeValue: number;

  @IsOptional()
  discountValue: number;

  @IsOptional()
  shipmentValue: number;

  @IsOptional()
  countOrderList: number;

  @IsOptional()
  countOrderItemList: number;

  @IsOptional()
  thisMonthValue: number;

  @IsOptional()
  thisMonthDiscountValue: number;

  @IsOptional()
  thisMonthShipmentValue: number;

  @IsOptional()
  thisMonthCountOrderList: number;

  @IsOptional()
  lastedOrder: Order;

  @IsOptional()
  tag: string[];

  @IsOptional()
  notation: string;

  @IsNotEmpty()
  status: CustomerStatus;

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

  @IsNotEmpty()
  merchant: Merchant;

  @IsNotEmpty()
  createdAt: Date;

  @IsOptional()
  deletedAt: Date;

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
    it.imageUpload = dto.imageUpload;
    it.orders = dto.orders;
    it.customerAddresses = dto.customerAddresses;
    it.user = dto.user;
    it.cart = dto.cart;
    it.createdAt = dto.createdAt;
    it.deletedAt = dto.deletedAt;

    return {
      ...it,
      customerLifeTimeValue: dto?.customerLifeTimeValue,
      orderValue: dto?.orderValue,
      discountValue: dto?.discountValue,
      shipmentValue: dto?.shipmentValue,
      countOrderList: dto?.countOrderList,
      countOrderItemList: dto?.countOrderItemList,
      lastedOrder: dto?.lastedOrder,
      thisMonthValue: dto?.thisMonthValue,
      thisMonthDiscountValue: dto?.thisMonthDiscountValue,
      thisMonthShipmentValue: dto?.thisMonthShipmentValue,
      thisMonthCountOrderList: dto?.thisMonthCountOrderList,
    };
  }

  public static fromEntity(entity: Customer, optional) {
    return this.from({
      id: entity.id,
      fullName: entity.fullName,
      countryCode: entity.countryCode,
      tel: entity.tel,
      email: entity.email,
      tag: entity.tag,
      notation: entity.notation,
      status: entity.status,
      imageUpload: entity.imageUpload,
      orders: entity.orders,
      customerAddresses: entity.customerAddresses,
      cart: entity.cart,
      user: entity.user,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      orderValue: optional?.orderValue,
      customerLifeTimeValue: optional?.customerLifeTimeValue,
      discountValue: optional?.discountValue,
      shipmentValue: optional?.shipmentValue,
      countOrderList: optional?.countOrderList,
      countOrderItemList: optional?.countOrderItemList,
      lastedOrder: optional?.lastedOrder,
      thisMonthValue: optional?.thisMonthValue,
      thisMonthDiscountValue: optional?.thisMonthDiscountValue,
      thisMonthShipmentValue: optional?.thisMonthShipmentValue,
      thisMonthCountOrderList: optional?.thisMonthCountOrderList,
    });
  }

  public static toEntity(dto: Partial<CustomerDto>) {
    const it = new Customer();
    it.id = dto.id;
    it.fullName = dto.fullName;
    it.countryCode = dto.countryCode;
    it.tel = dto.tel;
    it.email = dto.email;
    it.tag = dto.tag;
    it.notation = dto.notation;
    it.status = dto.status;
    it.imageUpload = dto.imageUpload;
    it.orders = dto.orders;
    it.customerAddresses = dto.customerAddresses;
    it.user = dto.user;
    it.cart = dto.cart;
    it.createdAt = dto.createdAt;

    return it;
  }
}
