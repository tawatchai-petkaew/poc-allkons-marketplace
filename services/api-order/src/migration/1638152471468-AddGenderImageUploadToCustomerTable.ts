import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenderImageUploadToCustomerTable1638152471468
  implements MigrationInterface
{
  name = 'AddGenderImageUploadToCustomerTable1638152471468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "gender" "customer_gender_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "customer" ADD "birthDate" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "imageUploadId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "FK_1116f024267a7c70efa23f961a8" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP CONSTRAINT "FK_1116f024267a7c70efa23f961a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "imageUploadId"`,
    );
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "birthDate"`);
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "customer_gender_enum"`);
  }
}
