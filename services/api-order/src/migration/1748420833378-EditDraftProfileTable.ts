import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditDraftProfileTable1748420833378 implements MigrationInterface {
  name = 'EditDraftProfileTable1748420833378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ADD "username" character varying(16)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "draft_profile"."username" IS 'username'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "draft_profile"."username" IS 'username'`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" DROP COLUMN "username"`,
    );
  }
}
