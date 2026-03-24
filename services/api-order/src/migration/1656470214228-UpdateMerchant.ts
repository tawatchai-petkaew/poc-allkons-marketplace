import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMerchant1656470214228 implements MigrationInterface {
  name = 'UpdateMerchant1656470214228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "primaryColor" character varying NOT NULL DEFAULT '#000000'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "primaryColor"`,
    );
  }
}
