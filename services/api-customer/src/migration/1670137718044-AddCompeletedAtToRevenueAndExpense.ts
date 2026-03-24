import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompeletedAtToRevenueAndExpense1670137718044
  implements MigrationInterface {
  name = 'AddCompeletedAtToRevenueAndExpense1670137718044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" ADD "completedAt" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_statement" ADD "completedAt" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_statement" DROP COLUMN "completedAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" DROP COLUMN "completedAt"`
    );
  }
}
