import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminTable1634527761513 implements MigrationInterface {
  name = 'CreateAdminTable1634527761513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "admin_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TYPE "admin_gender_enum" AS ENUM('male', 'female')`
    );
    await queryRunner.query(
      `CREATE TABLE "admin" ("id" SERIAL NOT NULL, "fullName" character varying, "countryCode" character varying, "tel" character varying, "status" "admin_status_enum" NOT NULL DEFAULT 'active', "gender" "admin_gender_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, "merchantId" integer, "imageUploadId" integer, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_f7d0b8b78d01089333c00543ac6" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_fd12a576bd8d396b35092e54a02" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_fd12a576bd8d396b35092e54a02"`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_f7d0b8b78d01089333c00543ac6"`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_f8a889c4362d78f056960ca6dad"`
    );
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(`DROP TYPE "admin_gender_enum"`);
    await queryRunner.query(`DROP TYPE "admin_status_enum"`);
  }
}
