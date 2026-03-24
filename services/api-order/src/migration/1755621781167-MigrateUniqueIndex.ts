import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateUniqueIndex1755621781167 implements MigrationInterface {
  name = 'MigrateUniqueIndex1755621781167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99cd45e19090bceec7fb50f342"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_99cd45e19090bceec7fb50f342" ON "user_identity_documents" ("document_type", "draftOrganizeId") `,
    );
  }
}
