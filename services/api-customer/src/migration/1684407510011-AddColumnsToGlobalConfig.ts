import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsToGlobalConfig1684407510011
  implements MigrationInterface {
  name = 'AddColumnsToGlobalConfig1684407510011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "isCheckBackendAppleLogin" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "iosBuildNumber" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "androidBuildNumber" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" ADD "key" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" ADD "data" jsonb`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_application_deployment_status_enum" RENAME TO "merchant_application_deployment_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_application_deployment_status_enum" AS ENUM('request', 'prepare', 'review', 'pendingDeploy', 'waitingReview', 'success', 'draft', 'frozen')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" TYPE "public"."merchant_application_deployment_status_enum" USING "status"::"text"::"public"."merchant_application_deployment_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" SET DEFAULT 'prepare'`
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_application_deployment_status_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_application_deployment_status_enum_old" AS ENUM('darft', 'pendingDeploy', 'prepare', 'request', 'review', 'success')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" TYPE "public"."merchant_application_deployment_status_enum_old" USING "status"::"text"::"public"."merchant_application_deployment_status_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ALTER COLUMN "status" SET DEFAULT 'prepare'`
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_application_deployment_status_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_application_deployment_status_enum_old" RENAME TO "merchant_application_deployment_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" DROP COLUMN "data"`
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" DROP COLUMN "key"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "androidBuildNumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "iosBuildNumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "isCheckBackendAppleLogin"`
    );
  }
}
