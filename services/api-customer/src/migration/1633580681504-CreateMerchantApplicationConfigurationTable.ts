import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantApplicationConfigurationTable1633580681504
  implements MigrationInterface {
  name = 'CreateMerchantApplicationConfigurationTable1633580681504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_icon" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "REL_c243abadfed007c4bc87a26ef3" UNIQUE ("merchantApplicationConfigurationId"), CONSTRAINT "PK_bae21bddf8ffb506dbb65dc53b0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_on_boarding" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "PK_9c75689c9d7d5b266026399ee96" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration_splash_screen" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantApplicationConfigurationId" integer, "imageUploadId" integer, CONSTRAINT "REL_15bfce6a5de979ab5e49f78289" UNIQUE ("merchantApplicationConfigurationId"), CONSTRAINT "PK_8a95a7a8b5ca6c236ffea336799" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_configuration" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_ce8ecea0a5b1d345ab3030237de" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon" ADD CONSTRAINT "FK_c243abadfed007c4bc87a26ef37" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon" ADD CONSTRAINT "FK_f90df246777eef82f1520b752bd" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_on_boarding" ADD CONSTRAINT "FK_1b0b8dbd0d81f3d6e0ad1e10c24" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_on_boarding" ADD CONSTRAINT "FK_2d52c6833565c90e6dddc48025a" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_splash_screen" ADD CONSTRAINT "FK_15bfce6a5de979ab5e49f782892" FOREIGN KEY ("merchantApplicationConfigurationId") REFERENCES "merchant_application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_splash_screen" ADD CONSTRAINT "FK_3d6399db08882c7ea218f218026" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration" ADD CONSTRAINT "FK_6b5c68fd7a5d6c56d13e84b858a" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration" DROP CONSTRAINT "FK_6b5c68fd7a5d6c56d13e84b858a"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_splash_screen" DROP CONSTRAINT "FK_3d6399db08882c7ea218f218026"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_splash_screen" DROP CONSTRAINT "FK_15bfce6a5de979ab5e49f782892"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_on_boarding" DROP CONSTRAINT "FK_2d52c6833565c90e6dddc48025a"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_on_boarding" DROP CONSTRAINT "FK_1b0b8dbd0d81f3d6e0ad1e10c24"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon" DROP CONSTRAINT "FK_f90df246777eef82f1520b752bd"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_configuration_icon" DROP CONSTRAINT "FK_c243abadfed007c4bc87a26ef37"`
    );
    await queryRunner.query(`DROP TABLE "merchant_application_configuration"`);
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_splash_screen"`
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_on_boarding"`
    );
    await queryRunner.query(
      `DROP TABLE "merchant_application_configuration_icon"`
    );
  }
}
