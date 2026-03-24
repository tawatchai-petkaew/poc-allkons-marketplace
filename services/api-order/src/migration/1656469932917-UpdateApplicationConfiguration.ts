import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateApplicationConfiguration1656469932917
  implements MigrationInterface
{
  name = 'UpdateApplicationConfiguration1656469932917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_banner" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "REL_67ac18939b935c39d67fd3a34b" UNIQUE ("merchantApplicationConfigurationId"), CONSTRAINT "PK_f34633422b90ae1b4d17966f91e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_android_screenshot" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "PK_d29d7c59b87d917142cb3af8543" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_large_ios_screenshot" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "PK_567ab73ed9f1d8d74984471705f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_small_ios_screenshot" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "PK_32d821ca62b1e4a9ffbb9057ed5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration" ADD "feature" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_banner" ADD CONSTRAINT "FK_67ac18939b935c39d67fd3a34bb" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_banner" ADD CONSTRAINT "FK_4538f1fdbcb83a5a4f97ad014de" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_android_screenshot" ADD CONSTRAINT "FK_83ad480aee4f243ae43b9de61d3" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_android_screenshot" ADD CONSTRAINT "FK_bfae1f73aa2b049024a5974c9e1" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_large_ios_screenshot" ADD CONSTRAINT "FK_3be81a36285843fb8b342340f0d" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_large_ios_screenshot" ADD CONSTRAINT "FK_03bde753bf371013fe18e592d80" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_small_ios_screenshot" ADD CONSTRAINT "FK_6fa92a7fbd6b9ba06a4f1013ed0" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_small_ios_screenshot" ADD CONSTRAINT "FK_ae7605862b7da933b4eb0dcf6c4" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_small_ios_screenshot" DROP CONSTRAINT "FK_ae7605862b7da933b4eb0dcf6c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_small_ios_screenshot" DROP CONSTRAINT "FK_6fa92a7fbd6b9ba06a4f1013ed0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_large_ios_screenshot" DROP CONSTRAINT "FK_03bde753bf371013fe18e592d80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_large_ios_screenshot" DROP CONSTRAINT "FK_3be81a36285843fb8b342340f0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_android_screenshot" DROP CONSTRAINT "FK_bfae1f73aa2b049024a5974c9e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_android_screenshot" DROP CONSTRAINT "FK_83ad480aee4f243ae43b9de61d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_banner" DROP CONSTRAINT "FK_4538f1fdbcb83a5a4f97ad014de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_banner" DROP CONSTRAINT "FK_67ac18939b935c39d67fd3a34bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration" DROP COLUMN "feature"`,
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_small_ios_screenshot"`,
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_large_ios_screenshot"`,
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_android_screenshot"`,
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_banner"`,
    );
  }
}
