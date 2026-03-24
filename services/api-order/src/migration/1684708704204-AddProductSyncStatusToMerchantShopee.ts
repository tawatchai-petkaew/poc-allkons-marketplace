import { MigrationInterface, QueryRunner } from 'typeorm';

export class addProductSyncStatusToMerchantShopee1684708704204
  implements MigrationInterface
{
  name = 'addProductSyncStatusToMerchantShopee1684708704204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "products_sync_status" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "base_shopee_entity" ADD CONSTRAINT "UQ_cf6e91fddb388e7835d1f2bc43e" UNIQUE ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "base_shopee_entity" DROP CONSTRAINT "UQ_cf6e91fddb388e7835d1f2bc43e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "products_sync_status"`,
    );
  }
}
