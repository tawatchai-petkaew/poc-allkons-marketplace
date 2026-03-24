import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSyncOrderStatusToMerchantTikTok1685356031224
  implements MigrationInterface {
  name = 'AddSyncOrderStatusToMerchantTikTok1685356031224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "syncedOrdersAmount" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "ordersAmount" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "syncedOrderAt" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "syncedOrderAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "ordersAmount"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "syncedOrdersAmount"`
    );
  }
}
