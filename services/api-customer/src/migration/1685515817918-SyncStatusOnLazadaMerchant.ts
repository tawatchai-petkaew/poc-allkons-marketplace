import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncStatusOnLazadaMerchant1685515817918
  implements MigrationInterface {
  name = 'SyncStatusOnLazadaMerchant1685515817918';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_lazada_syncproductstatus_enum" AS ENUM('syncing', 'synced', 'failed')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "syncProductStatus" "public"."merchant_lazada_syncproductstatus_enum" NOT NULL DEFAULT 'synced'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "syncedProductsAmount" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "productsAmount" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "syncedAt" TIMESTAMP`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_lazada_syncorderstatus_enum" AS ENUM('syncing', 'synced', 'failed')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "syncOrderStatus" "public"."merchant_lazada_syncorderstatus_enum" NOT NULL DEFAULT 'synced'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "syncedOrdersAmount" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "ordersAmount" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "syncedOrderAt" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "syncedOrderAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "ordersAmount"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "syncedOrdersAmount"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "syncOrderStatus"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_lazada_syncorderstatus_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "syncedAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "productsAmount"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "syncedProductsAmount"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "syncProductStatus"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_lazada_syncproductstatus_enum"`
    );
  }
}
