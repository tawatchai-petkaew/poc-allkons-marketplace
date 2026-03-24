import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeeplinkToDeploymentTable1677654718648
  implements MigrationInterface {
  name = 'AddDeeplinkToDeploymentTable1677654718648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD "deeplinkHostUrl" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP COLUMN "deeplinkHostUrl"`
    );
  }
}
