import {
  DeliveryReceiveType,
  DeliveryType,
  PaymentMethod,
  PaymentStatus,
} from '../enum/payment.enum';
import { SubOrderStatus } from '../enum/suborder.enum';

export interface IOrderRequest {
  userId: number;
  organizeId: number;
  cartId: number;
  totalPrice: number;
  totalDeliveryPrice: number;
  grandTotal: number;
  deliveryType: DeliveryType;
  deliveryReceiveType: DeliveryReceiveType;
  deliveries: DeliverySubOrder[];
}

export interface DeliverySubOrder {
  refPONumber: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryNote: string;
  deliveryBy: string;
  products: OrderItemProduct[];
  documents: Documents;
  address: Address | null;
}

export interface Address {
  shipping: Shipping;
}

export interface Shipping {
  addressName: string;
  address: string;
  countryId: number | string;
  provinceId: number | string;
  districtId: number | string;
  subDistrictId: number | string;
  zipCodeId: number | string;
  receiverName: string;
  receiverPhone: string;
  projectName: string;
}

export interface Documents {
  po: FileRequest[];
}

export interface FileRequest {
  fileId: number;
}

export interface OrderItemProduct {
  productItemId: number;
  price: number;
  quantity: number;
  unit: string;
  productItemName?: string;
  productItemImageUrl?: string;
}
// suborder

export interface IOrderResponse {
  id: number;
  number: string;
  status: string;
  channel: string | null;
  orderedAt: string;
  completedAt: string | null;
  cancelAt: string | null;
  cancelReason: string | null;
  cancelBy: string | null;
  note: string | null;
  publicUuid: string;
  publicExpiredDate: string | null;
  orderType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  merchantId: number;
  merchantName: string;
  userId: number;
  organizationId: number;
  cartId: number;
  totalPrice: number;
  totalDeliveryPrice: number;
  grandTotal: number;
  deliveryType: DeliveryType;
  deliveryReceiveType: DeliveryReceiveType;
  subOrders: ISubOrderResponse[];
}

export interface ISubOrderResponse {
  countryName: string;
  provinceName: string;
  districtName: string;
  subDistrictName: string;
  zipCode: string;
  id: number;
  subOrderNumber: string;
  status: SubOrderStatus;
  orderId: number;
  refPONumber: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryBy: string;
  deliveryPrice: number;
  deliveryNote: string;
  receiverName: string;
  receiverPhone: string;
  projectName: string;
  addressName: string;
  address: string;
  countryId: number;
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  zipcodeId: number;
  zipcodeName: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  documents: any[];
  orderItems: IOrderItemResponse[];
  payment: IOrderPaymentResponse;
}

export interface IOrderItemResponse {
  id: number;
  quantity: number;
  unit: string;
  smallUnitQuantity: number | null;
  bigUnitQuantity: number | null;
  price: number;
  productItemId: number;
  productItemSlug: string | null;
  productItemName: string;
  productItemImageUrl: string;
  isBigUnit: boolean | null;
  onFlashSale: boolean | null;
  onFlashSaleName: string | null;
  orderItemType: string;
  voucherQuantity: number | null;
  voucherExpiredDays: number | null;
  voucherUsedPerUser: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  orderId: number;
  subOrderId: number;
  productItem: IProductItemResponse;
}

export interface IProductItemResponse {
  id: number;
  slug: string | null;
  primaryOptionsValue: string | null;
  secondaryOptionsValue: string | null;
  price: number;
  bigUnitPrice: number | null;
  cost: number;
  soldQuantity: number;
  productItemIdTikTok: string | null;
  productItemIdLazada: string | null;
  voucherQuantity: number | null;
  voucherExpiredDays: number | null;
  voucherUsedPerUser: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productDiscount: IProductDiscountResponse;
}

export interface IProductDiscountResponse {
  id: number;
  type: string;
  unitType: string;
  value: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// order payment data

export interface IOrderPaymentResponse {
  id: number;
  orderId: number;
  payAmount: string;
  payTime: string;
  paymentMethod: PaymentMethod;
  processingFeeNet: string | null;
  status: PaymentStatus;
  transactionCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderCountResponse {
  count: string;
  status: SubOrderStatus;
}
