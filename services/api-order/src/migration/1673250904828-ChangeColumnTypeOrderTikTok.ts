import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeColumnTypeOrderTikTok1673250904828
  implements MigrationInterface
{
  name = 'ChangeColumnTypeOrderTikTok1673250904828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_tik_tok" DROP COLUMN "shipping_provider_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_tik_tok" ADD "shipping_provider_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_original_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_original_price" double precision DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_sale_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_sale_price" double precision DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_platform_discount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_platform_discount" double precision DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_seller_discount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_seller_discount" double precision DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_platform_discount_total"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_platform_discount_total" double precision DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_small_order_fee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_small_order_fee" double precision DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_small_order_fee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_small_order_fee" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_platform_discount_total"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_platform_discount_total" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_seller_discount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_seller_discount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_platform_discount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_platform_discount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_sale_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_sale_price" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP COLUMN "sku_original_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD "sku_original_price" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_tik_tok" DROP COLUMN "shipping_provider_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_tik_tok" ADD "shipping_provider_id" integer`,
    );
  }
}
