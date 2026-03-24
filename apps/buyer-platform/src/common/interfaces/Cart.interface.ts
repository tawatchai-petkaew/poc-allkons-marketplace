import { ProductDiscount } from './product.interface';

interface ImageUpload {
  id: number;
  imageName: string | null;
  name: string;
  size: string;
  url: string;
  onDeletePermanent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Stock {
  id: number;
  remaining: number;
  isServiceProduct: boolean;
  onValidateStock: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ProductItem {
  id: number;
  slug: string;
  primaryOptionsValue: string;
  secondaryOptionsValue: string;
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
  productDiscount: ProductDiscount | null;
  productBigUnitDiscount: ProductDiscount | null;
  stock: Stock;
  imageUpload: ImageUpload;
}

interface ProductImage {
  id: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: ImageUpload;
}

interface ProductOption {
  id: number;
  name: string;
  options: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Product {
  id: number;
  name: string;
  productItems: ProductItem[];
  highlight: string;
  description: string;
  unit: string;
  bigUnit: string;
  slug: string;
  minFinalProductPrice: number;
  maxFinalProductPrice: number;
  barCode: string | null;
  videoUrl: string;
  model: string | null;
  soldQuantity: number;
  piecePerBigUnit: number | null;
  weightSize: number;
  widthSize: number;
  lengthSize: number;
  heightSize: number;
  type: string;
  kind: string;
  isRecommend: boolean;
  isPopular: boolean;
  isNew: boolean;
  relationStatus: string;
  valueCustomRelationStatus: string[];
  createdAt: string;
  updatedAt: string;
  productImages: ProductImage[];
  isPackage: boolean;
  productPrimaryOption: ProductOption;
  productSecondaryOption: ProductOption;
  isContactOnly: boolean;
  telContact: string | null;
  emailContact: string | null;
  lineContact: string | null;
  facebookContact: string | null;
  instagramContact: string | null;
  urlGoogleMap: string | null;
  isHideProductPrice: boolean;
}

export interface ICartItem {
  id: number;
  quantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productItem: {
    id: number;
    slug: string;
    primaryOptionsValue: string;
    secondaryOptionsValue: string;
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
    product: Product;
    productDiscount: ProductDiscount | null;
    productBigUnitDiscount: ProductDiscount | null;
    stock: Stock;
  };
}

export interface ICart {
  id: number;
  cartItems: ICartItem[];
  merchant: {
    id: number;
    name: string | null;
    logo: string;
    organizeName?: string;
  };
}
