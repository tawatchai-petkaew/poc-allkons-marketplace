import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersSyncStatusToMerchantShopee1686219310398
  implements MigrationInterface
{
  name = 'AddOrdersSyncStatusToMerchantShopee1686219310398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "orders_sync_status" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" ADD CONSTRAINT "UQ_ee9f990e0e16287d89257dcb628" UNIQUE ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shopee" DROP CONSTRAINT "UQ_ee9f990e0e16287d89257dcb628"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "orders_sync_status"`,
    );
  }
}
