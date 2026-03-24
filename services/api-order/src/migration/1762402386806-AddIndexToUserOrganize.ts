import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToUserOrganize1762402386806 implements MigrationInterface {
  name = 'AddIndexToUserOrganize1762402386806';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_user_merchants_merchant_id" ON "user_merchants_merchant" ("merchantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_merchants_user_merchant" ON "user_merchants_merchant" ("userId", "merchantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_organization_created_at" ON "user_organization" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_organization_role_id" ON "user_organization" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_organization_user_id" ON "user_organization" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_organization_organize_status" ON "user_organization" ("organizeId", "memberStatus") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_tel_search" ON "user" ("countryCode", "tel") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_name_search" ON "user" ("firstNameTh", "lastNameTh") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_name_search_en" ON "user" ("firstNameEn", "lastNameEn") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_user_name_search"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_tel_search"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_organization_organize_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_organization_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_organization_role_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_organization_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_merchants_user_merchant"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_merchants_merchant_id"`,
    );
  }
}
