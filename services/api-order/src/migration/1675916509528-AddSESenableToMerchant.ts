import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSESenableToMerchant1675916509528 implements MigrationInterface {
  name = 'AddSESenableToMerchant1675916509528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "isEnableSES" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "isEnableSES"`);
  }
}
