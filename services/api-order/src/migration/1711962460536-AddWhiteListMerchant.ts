import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhiteListMerchant1711962460536 implements MigrationInterface {
  name = 'AddWhiteListMerchant1711962460536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditProductWhitelist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditProductWhitelists" text array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditProductWhitelists"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditProductWhitelist" jsonb`,
    );
  }
}
