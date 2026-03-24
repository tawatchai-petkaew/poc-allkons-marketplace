import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexPermission1762420002239 implements MigrationInterface {
  name = 'AddIndexPermission1762420002239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_permissions_code" ON "permissions" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_role_permission" ON "role_permissions" ("roleId", "permissionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" ("permissionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_organization_user_organize" ON "user_organization" ("userId", "organizeId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_organization_user_organize"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_role_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_permission_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_role_permission"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_permissions_code"`);
  }
}
