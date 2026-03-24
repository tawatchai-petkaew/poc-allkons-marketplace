import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerifiedAtToMerchantRevenueStatement1654594755340
  implements MigrationInterface {
  name = 'AddVerifiedAtToMerchantRevenueStatement1654594755340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" ADD "verifiedAt" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" DROP COLUMN "verifiedAt"`
    );
  }
}
