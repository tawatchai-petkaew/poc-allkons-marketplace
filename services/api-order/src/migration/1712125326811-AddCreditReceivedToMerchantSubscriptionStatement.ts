import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreditReceivedToMerchantSubscriptionStatement1712125326811
  implements MigrationInterface
{
  name = 'AddCreditReceivedToMerchantSubscriptionStatement1712125326811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package_statement" ADD "creditReceived" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package_statement" DROP COLUMN "creditReceived"`,
    );
  }
}
