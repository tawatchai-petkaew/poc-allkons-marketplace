import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToMerchantTable1622786916287
  implements MigrationInterface
{
  name = 'AddDeletedAtToMerchantTable1622786916287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "deleted_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "deleted_at"`);
  }
}
