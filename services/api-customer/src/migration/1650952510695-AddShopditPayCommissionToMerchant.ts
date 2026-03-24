import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopditPayCommissionToMerchant1650952510695
  implements MigrationInterface {
  name = 'AddShopditPayCommissionToMerchant1650952510695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditPayCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditPayCommission" double precision NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditPayCommission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditPayCommission"`
    );
  }
}
