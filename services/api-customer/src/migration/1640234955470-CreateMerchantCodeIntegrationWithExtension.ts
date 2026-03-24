import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantCodeIntegrationWithExtension1640234955470
  implements MigrationInterface {
  name = 'CreateMerchantCodeIntegrationWithExtension1640234955470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dbd_extension" ("id" SERIAL NOT NULL, "dbd" text, "dbdIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantCodeIntegrationId" integer, CONSTRAINT "REL_bf5d6adc0179ee0bf88f8bd2ad" UNIQUE ("merchantCodeIntegrationId"), CONSTRAINT "PK_42cd90cb19741a11d8221734e61" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "facebook_extension" ("id" SERIAL NOT NULL, "facebookPixel" text, "facebookPixelIsActive" boolean NOT NULL, "facebookMessengerCode" text, "facebookMessengerCodeIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantCodeIntegrationId" integer, CONSTRAINT "REL_b65b89cc734523511953c8f8c3" UNIQUE ("merchantCodeIntegrationId"), CONSTRAINT "PK_913eac36cbe6687a40d87ac2fe0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "google_extension" ("id" SERIAL NOT NULL, "googleAnalytics" text, "googleAnalyticsIsActive" boolean NOT NULL DEFAULT false, "googleTagManagerBefore" text, "googleTagManagerAfter" text, "googleTagManagerIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantCodeIntegrationId" integer, CONSTRAINT "REL_c274af2f77fe1e52a0687cc02a" UNIQUE ("merchantCodeIntegrationId"), CONSTRAINT "PK_82d144382433a45d039466eb8fc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "line_extension" ("id" SERIAL NOT NULL, "lineTag" text, "lineTagIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantCodeIntegrationId" integer, CONSTRAINT "REL_8c7c5b09c085fed4fa31697bb7" UNIQUE ("merchantCodeIntegrationId"), CONSTRAINT "PK_82e1c9dcc6668d3cc9eb6cf3299" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "tiktok_extension" ("id" SERIAL NOT NULL, "tiktokPixel" text, "tiktokPixelIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantCodeIntegrationId" integer, CONSTRAINT "REL_e057554329d9506a585a89d800" UNIQUE ("merchantCodeIntegrationId"), CONSTRAINT "PK_baf37fd6a7aff059280d064f190" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_code_integration" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_6002ca1b37ea1b2f038718bd72" UNIQUE ("merchantId"), CONSTRAINT "PK_84479cb8f143fbd30049a4a047c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "dbd_extension" ADD CONSTRAINT "FK_bf5d6adc0179ee0bf88f8bd2ad0" FOREIGN KEY ("merchantCodeIntegrationId") REFERENCES "merchant_code_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_extension" ADD CONSTRAINT "FK_b65b89cc734523511953c8f8c39" FOREIGN KEY ("merchantCodeIntegrationId") REFERENCES "merchant_code_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "google_extension" ADD CONSTRAINT "FK_c274af2f77fe1e52a0687cc02a2" FOREIGN KEY ("merchantCodeIntegrationId") REFERENCES "merchant_code_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "line_extension" ADD CONSTRAINT "FK_8c7c5b09c085fed4fa31697bb70" FOREIGN KEY ("merchantCodeIntegrationId") REFERENCES "merchant_code_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "tiktok_extension" ADD CONSTRAINT "FK_e057554329d9506a585a89d800c" FOREIGN KEY ("merchantCodeIntegrationId") REFERENCES "merchant_code_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_code_integration" ADD CONSTRAINT "FK_6002ca1b37ea1b2f038718bd727" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_code_integration" DROP CONSTRAINT "FK_6002ca1b37ea1b2f038718bd727"`
    );
    await queryRunner.query(
      `ALTER TABLE "tiktok_extension" DROP CONSTRAINT "FK_e057554329d9506a585a89d800c"`
    );
    await queryRunner.query(
      `ALTER TABLE "line_extension" DROP CONSTRAINT "FK_8c7c5b09c085fed4fa31697bb70"`
    );
    await queryRunner.query(
      `ALTER TABLE "google_extension" DROP CONSTRAINT "FK_c274af2f77fe1e52a0687cc02a2"`
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_extension" DROP CONSTRAINT "FK_b65b89cc734523511953c8f8c39"`
    );
    await queryRunner.query(
      `ALTER TABLE "dbd_extension" DROP CONSTRAINT "FK_bf5d6adc0179ee0bf88f8bd2ad0"`
    );
    await queryRunner.query(`DROP TABLE "merchant_code_integration"`);
    await queryRunner.query(`DROP TABLE "tiktok_extension"`);
    await queryRunner.query(`DROP TABLE "line_extension"`);
    await queryRunner.query(`DROP TABLE "google_extension"`);
    await queryRunner.query(`DROP TABLE "facebook_extension"`);
    await queryRunner.query(`DROP TABLE "dbd_extension"`);
  }
}
