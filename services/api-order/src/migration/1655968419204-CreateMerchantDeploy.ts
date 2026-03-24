import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantDeploy1655968419204 implements MigrationInterface {
  name = 'CreateMerchantDeploy1655968419204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_application_deployment_status_enum" AS ENUM('request', 'prepare', 'review', 'pendingDeploy', 'success')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_application_deployment" ("id" SERIAL NOT NULL, "status" "merchant_application_deployment_status_enum" NOT NULL DEFAULT 'prepare', "version" character varying, "remark" text, "requestedAt" TIMESTAMP, "preparedAt" TIMESTAMP, "reviewedAt" TIMESTAMP, "pendingDeployedAt" TIMESTAMP, "successedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_9d088a8dff755799429585de0f" UNIQUE ("merchantId"), CONSTRAINT "PK_e516e4f60527cdb38cbcfc03239" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_apple_configuration" ("id" SERIAL NOT NULL, "clientId" character varying NOT NULL, "teamId" character varying NOT NULL, "keyId" character varying NOT NULL, "fileNameKeyId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_fc6fd6ebcf78ae5ec333465c24" UNIQUE ("merchantId"), CONSTRAINT "PK_b10546655f38c819f4ed8bdefe6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" ADD CONSTRAINT "FK_9d088a8dff755799429585de0fe" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_apple_configuration" ADD CONSTRAINT "FK_fc6fd6ebcf78ae5ec333465c245" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_apple_configuration" DROP CONSTRAINT "FK_fc6fd6ebcf78ae5ec333465c245"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_application_deployment" DROP CONSTRAINT "FK_9d088a8dff755799429585de0fe"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_apple_configuration"`);
    await queryRunner.query(`DROP TABLE "merchant_application_deployment"`);
    await queryRunner.query(
      `DROP TYPE "merchant_application_deployment_status_enum"`,
    );
  }
}
