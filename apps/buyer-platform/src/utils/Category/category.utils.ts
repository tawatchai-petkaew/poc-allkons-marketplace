import { IProductCategory } from '@/common/interfaces/ProductCatagory.interface';

export function findCategoriesByPath(
  categories: IProductCategory[],
  path: string
) {
  const pathIds = path.split('.').map((id) => parseInt(id, 10));
  const result = [];
  let currentCategories = categories;

  for (const id of pathIds) {
    const category = currentCategories.find((cat) => cat.id === id);

    if (!category) {
      return [];
    }

    result.push(category);

    currentCategories = category.subCategories || [];
  }

  return result;
}
