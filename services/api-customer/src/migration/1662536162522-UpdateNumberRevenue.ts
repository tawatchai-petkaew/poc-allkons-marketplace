import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNumberRevenue1662536162522 implements MigrationInterface {
  name = 'UpdateNumberRevenue1662536162522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" DROP CONSTRAINT "UQ_b449f080d3f057cc252c4edf8cc"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" ADD CONSTRAINT "UQ_b449f080d3f057cc252c4edf8cc" UNIQUE ("number")`
    );
  }
}
