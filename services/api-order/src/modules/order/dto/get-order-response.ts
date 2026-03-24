import { ApiProperty } from '@nestjs/swagger';

class ProductDiscountResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  unitType: string;

  @ApiProperty()
  value: number;

  @ApiProperty({ type: String, nullable: true })
  startDate: string | null;

  @ApiProperty({ type: String, nullable: true })
  endDate: string | null;
}

class ProductItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  slug: string | null;

  @ApiProperty({ nullable: true })
  primaryOptionsValue: string | null;

  @ApiProperty({ nullable: true })
  secondaryOptionsValue: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  bigUnitPrice: number;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  soldQuantity: number;

  @ApiProperty({ type: () => ProductDiscountResponseDto, nullable: true })
  productDiscount: ProductDiscountResponseDto | null;
}

class OrderItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  smallUnitQuantity: number;

  @ApiProperty({ nullable: true })
  bigUnitQuantity: number | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  productItemId: number;

  @ApiProperty({ nullable: true })
  productItemSlug: string | null;

  @ApiProperty({ nullable: true })
  productItemName: string | null;

  @ApiProperty({ nullable: true })
  productItemImageUrl: string | null;

  @ApiProperty({ type: () => ProductItemResponseDto })
  productItem: ProductItemResponseDto;
}

class DocumentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  subOrderId: number;

  @ApiProperty()
  documentType: string;

  @ApiProperty()
  fileId: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  fileName: string;
}

class SubOrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  subOrderNumber: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  refPONumber: string;

  @ApiProperty()
  deliveryDate: string;

  @ApiProperty()
  deliveryTime: string;

  @ApiProperty()
  deliveryBy: string;

  @ApiProperty()
  deliveryPrice: number;

  @ApiProperty({ nullable: true })
  deliveryNote: string | null;

  @ApiProperty()
  receiverName: string;

  @ApiProperty()
  receiverPhone: string;

  @ApiProperty()
  projectName: string;

  @ApiProperty()
  addressName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  countryId: number;

  @ApiProperty()
  provinceId: number;

  @ApiProperty()
  districtId: number;

  @ApiProperty()
  subDistrictId: number;

  @ApiProperty()
  zipcodeId: number;

  @ApiProperty()
  remark: string;

  @ApiProperty()
  countryName: string;

  @ApiProperty()
  provinceName: string;

  @ApiProperty()
  districtName: string;

  @ApiProperty()
  subDistrictName: string;

  @ApiProperty()
  zipCode: string;

  @ApiProperty({ type: [DocumentResponseDto] })
  documents: DocumentResponseDto[];

  @ApiProperty({ type: [OrderItemResponseDto] })
  orderItems: OrderItemResponseDto[];
}

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  number: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  channel: string | null;

  @ApiProperty()
  orderedAt: string;

  @ApiProperty({ nullable: true })
  completedAt: string | null;

  @ApiProperty({ nullable: true })
  cancelAt: string | null;

  @ApiProperty({ nullable: true })
  cancelReason: string | null;

  @ApiProperty({ nullable: true })
  cancelBy: string | null;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty()
  publicUuid: string;

  @ApiProperty({ nullable: true })
  publicExpiredDate: string | null;

  @ApiProperty()
  orderType: string;

  @ApiProperty()
  merchantId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  organizationId: number;

  @ApiProperty()
  cartId: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  totalDeliveryPrice: number;

  @ApiProperty()
  grandTotal: number;

  @ApiProperty()
  deliveryType: string;

  @ApiProperty()
  deliveryReceiveType: string;

  @ApiProperty({ type: [SubOrderResponseDto] })
  subOrders: SubOrderResponseDto[];
}

export class OrderListResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageLimit: number;

  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];
}
