export interface CategoryTreeNode {
  id: number;
  name: string;
  child: CategoryTreeNode | null;
}

export interface CategoryHierarchyResult {
  productVariantId: number;
  categoryTree: CategoryTreeNode | null;
}
