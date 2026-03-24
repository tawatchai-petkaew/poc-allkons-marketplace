import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppUrlAndCountToAppDeploy1656035340795
  implements MigrationInterface
{
  name = 'AddAppUrlAndCountToAppDeploy1656035340795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "iosAppUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "androidAppUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "deployCount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "deployCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "androidAppUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "iosAppUrl"`,
    );
  }
}
