import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDraftOrganizeFileInfo1759136134766
  implements MigrationInterface
{
  name = 'UpdateDraftOrganizeFileInfo1759136134766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "draft_organize" ADD "fileInfo" json`);
    await queryRunner.query(
      `COMMENT ON COLUMN "draft_organize"."fileInfo" IS 'file info'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "draft_organize"."fileInfo" IS 'file info'`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_organize" DROP COLUMN "fileInfo"`,
    );
  }
}
