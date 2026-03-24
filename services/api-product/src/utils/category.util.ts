import { BuyerCategoryNode } from "@/modules-v1/buyer-product-category/interface/merchant-product-category.interface";

export function buildTree<T>({
  items,
  getId,
  getParentId,
  createNode,
}: {
  items: T[];
  getId: (item: T) => number;
  getParentId: (item: T) => number | null | undefined;
  createNode: (item: T) => BuyerCategoryNode;
}): BuyerCategoryNode[] {
  const map = new Map<number, BuyerCategoryNode>();
  const roots: BuyerCategoryNode[] = [];

  items.forEach((item) => {
    const id = getId(item);
    map.set(id, createNode(item));
  });

  items.forEach((item) => {
    const id = getId(item);
    const parentId = getParentId(item);
    const node = map.get(id);
    if (!node) return;

    if (!parentId) {
      roots.push(node);
    } else {
      const parent = map.get(parentId);
      if (parent) {
        parent.subCategories.push(node);
      } else {
        roots.push(node); // orphan safety
      }
    }
  });

  return roots;
}
