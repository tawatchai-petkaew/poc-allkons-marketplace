interface ImageUpload {
  id: number;
  imageName: string;
  name: string;
  size: string;
  url: string;
  onDeletePermanent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface BannerMerchant {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: ImageUpload;
}

interface Product {
  id: number;
  slug: string;
  minFinalProductPrice: number;
  maxFinalProductPrice: number;
  barCode: string | null;
  videoUrl: string;
  model: string;
  piecePerBigUnit: number;
  weightSize: number;
  widthSize: number;
  lengthSize: number;
  heightSize: number;
  soldQuantity: number;
  type: string;
  kind: string;
  isRecommend: boolean;
  isPopular: boolean;
  isNew: boolean;
  isPackage: boolean;
  relationStatus: string;
  valueCustomRelationStatus: string | null;
  isContactOnly: boolean;
  isHideProductPrice: boolean;
  telContact: string | null;
  emailContact: string | null;
  lineContact: string | null;
  facebookContact: string | null;
  instagramContact: string | null;
  urlGoogleMap: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IBanner {
  id: number;
  type: string;
  isOpenNewWindow: boolean;
  url: string;
  product: Product;
  article: null;
  productBrand: null;
  productCategory: null;
  productCatalog: null;
  bannerMerchantDesktop: BannerMerchant;
  bannerMerchantApplication: BannerMerchant;
}
