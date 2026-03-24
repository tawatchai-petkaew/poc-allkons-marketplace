import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'merchant_category_view',
  expression: `
    SELECT DISTINCT
      mp."merchantId" as merchant_id,
      p."categoryId" as category_id,
      c.name as category_name,
      c."parentCategoryId" as parent_category_id,
      c."imageUploadId" as image_upload_id,
      iu.url as image_url
    FROM merchant_product mp
    JOIN product_variant pv ON mp."productVariantId" = pv.id
    JOIN product p ON pv."productId" = p.id
    JOIN category c ON p."categoryId" = c.id
    LEFT JOIN image_upload iu ON c."imageUploadId" = iu.id
    WHERE mp.status = 'Active'
      AND c.status = 'Active'
  `,
})
export class MerchantCategoryView {
  @ViewColumn({ name: 'merchant_id' })
  merchantId: number;

  @ViewColumn({ name: 'category_id' })
  categoryId: number;

  @ViewColumn({ name: 'category_name' })
  categoryName: string;

  @ViewColumn({ name: 'parent_category_id' })
  parentCategoryId: string | null;

  @ViewColumn({ name: 'image_upload_id' })
  imageUploadId: number | null;

  @ViewColumn({ name: 'image_url' })
  imageUrl: string | null;
}
