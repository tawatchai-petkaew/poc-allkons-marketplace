import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleServiceToDeployment1656306357686
  implements MigrationInterface
{
  name = 'AddGoogleServiceToDeployment1656306357686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" ADD "merchantApplicationDeploymentId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" ADD CONSTRAINT "UQ_40e66b071b704d48eff77d2786e" UNIQUE ("merchantApplicationDeploymentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" ADD "merchantApplicationDeploymentId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" ADD CONSTRAINT "UQ_33032641886b17099c1dfeee8aa" UNIQUE ("merchantApplicationDeploymentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" ADD CONSTRAINT "FK_40e66b071b704d48eff77d2786e" FOREIGN KEY ("merchantApplicationDeploymentId") REFERENCES "merchant_application_deployment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" ADD CONSTRAINT "FK_33032641886b17099c1dfeee8aa" FOREIGN KEY ("merchantApplicationDeploymentId") REFERENCES "merchant_application_deployment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" DROP CONSTRAINT "FK_33032641886b17099c1dfeee8aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" DROP CONSTRAINT "FK_40e66b071b704d48eff77d2786e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" DROP CONSTRAINT "UQ_33032641886b17099c1dfeee8aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" DROP COLUMN "merchantApplicationDeploymentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" DROP CONSTRAINT "UQ_40e66b071b704d48eff77d2786e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" DROP COLUMN "merchantApplicationDeploymentId"`,
    );
  }
}
