import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForCartProductCatProduct1762462209679
  implements MigrationInterface
{
  name = 'AddIndexesForCartProductCatProduct1762462209679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_cart_count" ON "cart_item" ("cartId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cart" ON "cart" ("merchantId", "organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_get_product_category" ON "product_category" ("merchantId", "status", "order") WHERE status = 'active'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_relation_products" ON "product" ("merchantId", "productCategoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_get_product_by_slug" ON "product" ("merchantId", "slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_get_new_product" ON "product" ("merchantId", "type", "isNew", "createdAt") WHERE "isNew" = true AND "type" = 'available'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_merchant" ON "merchant" ("slug") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_merchant"`);
    await queryRunner.query(`DROP INDEX "public"."idx_get_new_product"`);
    await queryRunner.query(`DROP INDEX "public"."idx_get_product_by_slug"`);
    await queryRunner.query(`DROP INDEX "public"."idx_relation_products"`);
    await queryRunner.query(`DROP INDEX "public"."idx_get_product_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cart"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cart_count"`);
  }
}
