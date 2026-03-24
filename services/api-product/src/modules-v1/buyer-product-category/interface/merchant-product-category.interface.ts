export interface BuyerCategoryNode {
  id: number;
  name: string;
  imageUploadId: number | null;
  imageUrl: string | null;
  parentCategoryId: number | null;
  subCategories: BuyerCategoryNode[];
}