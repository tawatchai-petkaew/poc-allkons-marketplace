import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtraLargeIosScreenshotToApplicationConfiguration1664136475483
  implements MigrationInterface
{
  name = 'AddExtraLargeIosScreenshotToApplicationConfiguration1664136475483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_extra_large_ios_screenshot" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "PK_36349ec2e762af1b1dbe53c053b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_extra_large_ios_screenshot" ADD CONSTRAINT "FK_92f09a691dac3264a5c7535f0a3" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_extra_large_ios_screenshot" ADD CONSTRAINT "FK_dd0b1221eed77d9b027d0109e7e" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_extra_large_ios_screenshot" DROP CONSTRAINT "FK_dd0b1221eed77d9b027d0109e7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_extra_large_ios_screenshot" DROP CONSTRAINT "FK_92f09a691dac3264a5c7535f0a3"`,
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_extra_large_ios_screenshot"`,
    );
  }
}
