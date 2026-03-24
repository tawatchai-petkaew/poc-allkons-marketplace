import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToSubscriptionPackage1656999492078
  implements MigrationInterface {
  name = 'AddIsActiveToSubscriptionPackage1656999492078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "isActive" boolean NOT NULL DEFAULT true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "isActive"`
    );
  }
}
