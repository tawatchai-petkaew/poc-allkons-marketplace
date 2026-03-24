interface ProductVariantDetailDtoModel {
  id: number;
  alias: string;
  sku: string | null;
  d365Sku: string | null;
  d365ItemCode: string | null;
  barcode: string;
  internalBarcode: string | null;
  d365Barcode: string;
  salesUnit: string;
  description: string;
  howToUseText: string | null;
  howToUseDocuments: any[]; // You might want to define a more specific type for documents if available
  suggestionText: string | null;
  suggestionDocuments: any[];
  cautionText: string | null;
  cautionDocuments: any[];
  packageWidth: number;
  packageWidthUnit: string;
  packageHeight: number;
  packageHeightUnit: string;
  packageDepth: number;
  packageDepthUnit: string;
  packageShape: string;
  productWidth: number;
  productWidthUnit: string;
  productHeight: number;
  productHeightUnit: string;
  productDepth: number;
  productDepthUnit: string;
  grossWeight: number;
  grossWeightUnit: string;
  netWeight: number;
  netWeightUnit: string;
  productStatus: string;
  status: string;
  productId: number;
  catalogDocuments: any[];
  productVariantImageDtoModels: ProductVariantImageDtoModel[];
  productVariantTagDtoModels: any[];
  productDimensionDtoModels: ProductDimensionDtoModel[];
  urlVideo: string | null;
  series: string;
  model: string;
  material: string;
  tis: string | null;
  guarantee: string | null;
  detailGuarantee: string;
  countryId: number;
  categoryId: number;
  categoryName: string;
  subCategory1Name: string;
  subCategory2Name: string;
  subCategory3Name: string;
  subCategory4Name: string | null;
  className: string | null;
  subClassName: string | null;
  brandDtoModel: BrandDtoModel;
}

interface ProductVariantImageDtoModel {
  productVariantImageId: number;
  productVariantId: number;
  documenImageId: number;
  fileSize: number;
  fileName: string;
  filePath: string;
  fileExtension: string;
  order: number;
}

interface ProductDimensionDtoModel {
  productVariantDimensionId: number;
  name: string;
  value: string;
}

interface BrandDtoModel {
  id: string;
  name: string;
  description: string | null;
  logoId: number;
  imagePath: string;
}

export interface IProductData {
  productVariantDetailDtoModel: ProductVariantDetailDtoModel;
  id: number;
  agentId: number;
  productVariantId: number;
  agentBarcode: string | null;
  barcode: string;
  internalBarcode: string | null;
  quantity: number | null;
  price: number;
  specialPrice: number | null;
  startDate: string | null;
  endDate: string | null;
  isAcceptCash: boolean;
  isAcceptCredit: boolean;
  isAcceptPledge: boolean;
  isAcceptCod: boolean;
  isAcceptCreditCard: boolean;
  agentProductStatus: string;
  inactiveDate: string | null;
  inactiveType: string | null;
  descriptionInactive: string | null;
  importProductFrom: string;
  updateBy: string | null;
  updateDate: string | null;
  productName: string;
  sku: string | null;
  d365Sku: string | null;
  name: string;
  productId: number;
  brandId: number;
  brandName: string;
  minimumDeliveryDate: string | null;
  defaultDeliveryDate: number;
  deliveryDateType: string;
}
