import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartDatePackageToMerchant1651723693089
  implements MigrationInterface
{
  name = 'AddStartDatePackageToMerchant1651723693089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "currentSubscriptionPackageStartDate" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "currentSubscriptionPackageStartDate"`,
    );
  }
}
