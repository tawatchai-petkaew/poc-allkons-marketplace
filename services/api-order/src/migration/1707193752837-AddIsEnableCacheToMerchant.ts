import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsEnableCacheToMerchant1707193752837
  implements MigrationInterface
{
  name = 'AddIsEnableCacheToMerchant1707193752837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "isEnableCache" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "isEnableCache"`,
    );
  }
}
