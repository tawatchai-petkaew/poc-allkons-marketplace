import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSyncStockOnProductLazada1685340892511
  implements MigrationInterface
{
  name = 'AddSyncStockOnProductLazada1685340892511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_lazada" ADD "onSyncStock" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_lazada" DROP COLUMN "onSyncStock"`,
    );
  }
}
