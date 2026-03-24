import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToFileUpload1755680145342 implements MigrationInterface {
  name = 'AddColumnToFileUpload1755680145342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."file_upload_type_enum" AS ENUM('temp', 'permanent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_upload" ADD "type" "public"."file_upload_type_enum" DEFAULT 'permanent'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file_upload" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."file_upload_type_enum"`);
  }
}
