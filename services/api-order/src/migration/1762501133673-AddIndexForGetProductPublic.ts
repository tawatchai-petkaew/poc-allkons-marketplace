import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexForGetProductPublic1762501133673
  implements MigrationInterface
{
  name = 'AddIndexForGetProductPublic1762501133673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Product Item indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_item_discount" ON "product_item" ("productDiscountId") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_item_product" ON "product_item" ("productId") WHERE "deleted_at" IS NULL`,
    );

    // Product Translation index
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_translation_product_locale" ON "product_translation" ("productId", "locale") WHERE "deleted_at" IS NULL`,
    );

    // Product indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_brand_id" ON "product" ("productBrandId") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_category_id" ON "product" ("productCategoryId") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_created_at" ON "product" ("createdAt") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_is_popular" ON "product" ("isPopular", "soldQuantity") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_is_recommend" ON "product" ("isRecommend", "soldQuantity") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_sold_quantity" ON "product" ("soldQuantity") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_merchant_type" ON "product" ("merchantId", "type") WHERE "deleted_at" IS NULL`,
    );

    // Product Image index
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_image_product" ON "product_image" ("productId") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop Product indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_merchant_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_sold_quantity"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_is_recommend"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_is_popular"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_brand_id"`,
    );

    // Drop Product Translation index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_translation_product_locale"`,
    );

    // Drop Product Item indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_item_product"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_item_discount"`,
    );

    // Drop Product Image index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_product_image_product"`,
    );
  }
}
