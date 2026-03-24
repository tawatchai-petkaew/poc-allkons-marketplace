import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexesForArticle1762486387916 implements MigrationInterface {
    name = 'AddIndexesForArticle1762486387916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_flash_sale_end_date" ON "flash_sale" ("endDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_flash_sale_start_date" ON "flash_sale" ("startDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_flash_sale_status" ON "flash_sale" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_flash_sale_merchant_id" ON "flash_sale" ("merchantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_product_category_status" ON "product_category" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_product_category_merchant_id" ON "product_category" ("merchantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_product_catalog_name" ON "product_catalog" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_product_catalog_main_status" ON "product_catalog" ("mainStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_product_catalog_status" ON "product_catalog" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_product_catalog_merchant_id" ON "product_catalog" ("merchantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_banner_promotion_merchant_id" ON "banner_promotion" ("merchantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_article_released_at" ON "article" ("releasedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_article_name" ON "article" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_article_tag" ON "article" ("tag") `);
        await queryRunner.query(`CREATE INDEX "IDX_article_is_published" ON "article" ("isPublished") `);
        await queryRunner.query(`CREATE INDEX "IDX_article_merchant_id" ON "article" ("merchantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_banner_merchant_merchant_id" ON "banner_merchant" ("merchantId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_banner_merchant_merchant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_article_merchant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_article_is_published"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_article_tag"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_article_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_article_released_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_banner_promotion_merchant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_catalog_merchant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_catalog_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_catalog_main_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_catalog_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_category_merchant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_category_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_flash_sale_merchant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_flash_sale_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_flash_sale_start_date"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_flash_sale_end_date"`);
    }

}
