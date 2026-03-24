import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleLocaleInterfaceModeOnUserTable1623060382136
  implements MigrationInterface
{
  name = 'AddRoleLocaleInterfaceModeOnUserTable1623060382136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('admin', 'superAdmin', 'customer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "user_role_enum" NOT NULL DEFAULT 'customer'`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_locale_enum" AS ENUM('th', 'en')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "locale" "user_locale_enum" NOT NULL DEFAULT 'th'`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_interfacemode_enum" AS ENUM('dark', 'light')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "interfaceMode" "user_interfacemode_enum" NOT NULL DEFAULT 'light'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "interfaceMode"`);
    await queryRunner.query(`DROP TYPE "user_interfacemode_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "locale"`);
    await queryRunner.query(`DROP TYPE "user_locale_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
