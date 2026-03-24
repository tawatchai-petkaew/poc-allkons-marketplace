import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconAndroidToApplicationConfiguration1676362612039
  implements MigrationInterface {
  name = 'AddIconAndroidToApplicationConfiguration1676362612039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_icon_android" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "REL_10095abe07ddb5613123e720bd" UNIQUE ("merchantApplicationConfigurationId"), CONSTRAINT "PK_218721f198b645644d1498caedc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon_android" ADD CONSTRAINT "FK_10095abe07ddb5613123e720bdb" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon_android" ADD CONSTRAINT "FK_dee7e50cad7f3b47f56c82b63a2" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon_android" DROP CONSTRAINT "FK_dee7e50cad7f3b47f56c82b63a2"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon_android" DROP CONSTRAINT "FK_10095abe07ddb5613123e720bdb"`
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_icon_android"`
    );
  }
}
