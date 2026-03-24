import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDraftToApplicationDeployment1679987304478
  implements MigrationInterface
{
  name = 'AddDraftToApplicationDeployment1679987304478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "merchant_application_deployment_status_enum" RENAME TO "merchant_application_deployment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_application_deployment_status_enum" AS ENUM('request', 'prepare', 'review', 'pendingDeploy', 'success', 'darft')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" TYPE "merchant_application_deployment_status_enum" USING "status"::"text"::"merchant_application_deployment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" SET DEFAULT 'prepare'`,
    );
    await queryRunner.query(
      `DROP TYPE "merchant_application_deployment_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_application_deployment_status_enum_old" AS ENUM('request', 'prepare', 'review', 'pendingDeploy', 'success')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" TYPE "merchant_application_deployment_status_enum_old" USING "status"::"text"::"merchant_application_deployment_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" SET DEFAULT 'prepare'`,
    );
    await queryRunner.query(
      `DROP TYPE "merchant_application_deployment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "merchant_application_deployment_status_enum_old" RENAME TO "merchant_application_deployment_status_enum"`,
    );
  }
}
