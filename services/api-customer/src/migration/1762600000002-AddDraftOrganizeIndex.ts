import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDraftOrganizeIndex1762600000002 implements MigrationInterface {
  name = 'AddDraftOrganizeIndex1762600000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_draft_organize_organize_id"
       ON "draft_organize" ("organizeId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_draft_organize_organize_id"`,
    );
  }
}