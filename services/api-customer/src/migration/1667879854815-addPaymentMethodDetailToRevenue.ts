import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPaymentMethodDetailToRevenue1667879854815
  implements MigrationInterface {
  name = 'addPaymentMethodDetailToRevenue1667879854815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" ADD "paymentMethodDetail" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" DROP COLUMN "paymentMethodDetail"`
    );
  }
}
