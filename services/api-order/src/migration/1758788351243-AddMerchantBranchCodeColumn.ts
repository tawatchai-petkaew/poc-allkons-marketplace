import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantBranchCodeColumn1758788351243
  implements MigrationInterface
{
  name = 'AddMerchantBranchCodeColumn1758788351243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "merchantBranchCode" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "merchant"."merchantBranchCode" IS 'Branch code of the merchant if it is a BRANCH type'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "merchant"."merchantBranchCode" IS 'Branch code of the merchant if it is a BRANCH type'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "merchantBranchCode"`,
    );
  }
}
