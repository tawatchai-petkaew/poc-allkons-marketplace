import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSyncOrderStatusToMerchantTikTok1685381371339
  implements MigrationInterface
{
  name = 'AddSyncOrderStatusToMerchantTikTok1685381371339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_tik_tok_syncorderstatus_enum" AS ENUM('syncing', 'synced', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "syncOrderStatus" "public"."merchant_tik_tok_syncorderstatus_enum" NOT NULL DEFAULT 'synced'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "syncOrderStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_tik_tok_syncorderstatus_enum"`,
    );
  }
}
