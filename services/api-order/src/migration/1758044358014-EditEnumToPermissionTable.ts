import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditEnumToPermissionTable1758044358014
  implements MigrationInterface
{
  name = 'EditEnumToPermissionTable1758044358014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."permissions_group_enum" RENAME TO "permissions_group_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_group_enum" AS ENUM('ORGANIZATION_INFO', 'USER_ORGANIZATION', 'ROLE_PERMISSION', 'ORGANIZATION_PHONE', 'PAYMENT', 'BANK_ACCOUNT_INFO', 'MERCHANT', 'PROMOTION', 'PROMPTPAY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "group" TYPE "public"."permissions_group_enum" USING "group"::"text"::"public"."permissions_group_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."permissions_group_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_group_enum_old" AS ENUM('BANK_ACCOUNT_INFO', 'MERCHANT', 'ORGANIZATION_INFO', 'ORGANIZATION_PHONE', 'PAYMENT', 'PROMOTION', 'ROLE_PERMISSION', 'USER_ORGANIZATION')`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "group" TYPE "public"."permissions_group_enum_old" USING "group"::"text"::"public"."permissions_group_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."permissions_group_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."permissions_group_enum_old" RENAME TO "permissions_group_enum"`,
    );
  }
}
