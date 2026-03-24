import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileUploadTable1656296073434 implements MigrationInterface {
  name = 'CreateFileUploadTable1656296073434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "google_service_andriod_file" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fileUploadId" integer, CONSTRAINT "PK_22b210591491acec32fbc206f90" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "google_service_ios_file" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fileUploadId" integer, CONSTRAINT "PK_12a26497036a2c1b1508192968b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "file_upload" ("id" SERIAL NOT NULL, "fileName" character varying, "name" character varying, "size" character varying, "url" character varying NOT NULL, "onDeletePermanent" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_bb8460e39fcad3aaa44d1d7e5d3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" ADD CONSTRAINT "FK_58d2f2ee8b9d7d50ca783b2cc46" FOREIGN KEY ("fileUploadId") REFERENCES "file_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" ADD CONSTRAINT "FK_7d5ae93f2040bf78ffeecf88ae0" FOREIGN KEY ("fileUploadId") REFERENCES "file_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "file_upload" ADD CONSTRAINT "FK_5e607b2931c61bb63b100ca389c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file_upload" DROP CONSTRAINT "FK_5e607b2931c61bb63b100ca389c"`
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_ios_file" DROP CONSTRAINT "FK_7d5ae93f2040bf78ffeecf88ae0"`
    );
    await queryRunner.query(
      `ALTER TABLE "google_service_andriod_file" DROP CONSTRAINT "FK_58d2f2ee8b9d7d50ca783b2cc46"`
    );
    await queryRunner.query(`DROP TABLE "file_upload"`);
    await queryRunner.query(`DROP TABLE "google_service_ios_file"`);
    await queryRunner.query(`DROP TABLE "google_service_andriod_file"`);
  }
}
