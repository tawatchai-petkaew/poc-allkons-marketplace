import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyToMerchant1687681690704 implements MigrationInterface {
  name = 'AddCurrencyToMerchant1687681690704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "locationUTC" character varying NOT NULL DEFAULT '+7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "locationCurrencyIsoCode" character varying NOT NULL DEFAULT 'THB'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "locationCurrencySymbol" character varying NOT NULL DEFAULT '฿'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "locationCurrencySymbol"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "locationCurrencyIsoCode"`,
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "locationUTC"`);
  }
}
