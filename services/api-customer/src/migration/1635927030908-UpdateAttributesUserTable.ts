import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAttributesUserTable1635927030908
  implements MigrationInterface {
  name = 'UpdateAttributesUserTable1635927030908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "status" "user_status_enum" DEFAULT 'active'`
    );
    await queryRunner.query(
      `CREATE TYPE "user_gender_enum" AS ENUM('male', 'female')`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "gender" "user_gender_enum"`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "imageUploadId" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_4cf2363966d4b96d15afd1c907e" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_4cf2363966d4b96d15afd1c907e"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "imageUploadId"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "user_gender_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
  }
}
