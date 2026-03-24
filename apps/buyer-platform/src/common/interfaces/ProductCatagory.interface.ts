export enum ProductCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

export interface ImageUpload {
  id: number;
  imageName: string;
  name: string;
  size: string;
  url: string;
  onDeletePermanent: boolean;
  createdAt: Date; // Or Date if you parse it
  updatedAt: Date; // Or Date if you parse it
  deletedAt: Date | null; // Or Date | null
}

export interface IProductCategory {
  id: number;
  name: string;
  order: number;
  status: ProductCategoryStatus;
  path: string | null;
  imageUpload: ImageUpload;
  skuId: string | null;
  subCategories: IProductCategory[]; // This is crucial for the tree structure
  isChildren?: boolean;
}
