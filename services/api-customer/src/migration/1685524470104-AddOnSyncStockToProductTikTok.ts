import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnSyncStockToProductTikTok1685524470104
  implements MigrationInterface {
  name = 'AddOnSyncStockToProductTikTok1685524470104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD "onSyncStock" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP COLUMN "onSyncStock"`
    );
  }
}
