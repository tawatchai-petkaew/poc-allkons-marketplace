import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimezoneToMerchant1687749412447 implements MigrationInterface {
  name = 'AddTimezoneToMerchant1687749412447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "locationTimezone" character varying NOT NULL DEFAULT 'Asia/Bangkok'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "locationTimezone"`,
    );
  }
}
