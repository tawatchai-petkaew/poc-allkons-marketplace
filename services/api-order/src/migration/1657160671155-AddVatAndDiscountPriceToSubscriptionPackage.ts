import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVatAndDiscountPriceToSubscriptionPackage1657160671155
  implements MigrationInterface
{
  name = 'AddVatAndDiscountPriceToSubscriptionPackage1657160671155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "discountPrice" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "vat" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "vat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "discountPrice"`,
    );
  }
}
