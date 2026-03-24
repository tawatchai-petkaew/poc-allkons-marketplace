import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductAmountToMerchantTikTok1670412249530
  implements MigrationInterface
{
  name = 'AddProductAmountToMerchantTikTok1670412249530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_tik_tok_syncproductstatus_enum" AS ENUM('syncing', 'synced', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "syncProductStatus" "merchant_tik_tok_syncproductstatus_enum" NOT NULL DEFAULT 'synced'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "syncedProductsAmount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "productsAmount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD "syncedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "syncedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "productsAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "syncedProductsAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP COLUMN "syncProductStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "merchant_tik_tok_syncproductstatus_enum"`,
    );
  }
}
