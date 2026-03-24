export interface IProductVariantDimensionValue {
  productVaraintId: number;
  value: string;
  productDimensionMasterId: number;
  product_dimension_id: number;
}

export interface IMockupProductVariant {
  imageGroup: {
    filePath: string;
  }[];
  productName: string;
  // Use index signatures for dynamic dimension and dimensionValue properties
  [key: `dimension${number}`]: string; // e.g., dimension1, dimension2, etc. will be strings
  [key: `dimensionValue${number}`]: IProductVariantDimensionValue[]; // e.g., dimensionValue1, dimensionValue2, etc. will be arrays
}
