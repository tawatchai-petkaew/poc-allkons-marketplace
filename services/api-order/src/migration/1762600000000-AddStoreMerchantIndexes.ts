import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreMerchantIndexes1762600000000
  implements MigrationInterface
{
  name = 'AddStoreMerchantIndexes1762600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_store_organize_created"
       ON "store" ("organizeId", "createdAt" DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_merchant_store_created"
       ON "merchant" ("storeId", "createdAt" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_merchant_store_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_store_organize_created"`,
    );
  }
}
