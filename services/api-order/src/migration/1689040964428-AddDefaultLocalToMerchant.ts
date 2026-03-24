import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultLocalToMerchant1689040964428
  implements MigrationInterface
{
  name = 'AddDefaultLocalToMerchant1689040964428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_defaultlocale_enum" AS ENUM('th', 'en', 'cn', 'tw')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "defaultLocale" "public"."merchant_defaultlocale_enum" NOT NULL DEFAULT 'th'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "availableLocale" SET DEFAULT '{en,th,cn,tw}'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_locale_enum" RENAME TO "user_locale_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_locale_enum" AS ENUM('th', 'en', 'cn', 'tw')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "locale" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "locale" TYPE "public"."user_locale_enum" USING "locale"::"text"::"public"."user_locale_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "locale" SET DEFAULT 'th'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_locale_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_locale_enum_old" AS ENUM('th', 'en')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "locale" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "locale" TYPE "public"."user_locale_enum_old" USING "locale"::"text"::"public"."user_locale_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "locale" SET DEFAULT 'th'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_locale_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_locale_enum_old" RENAME TO "user_locale_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "availableLocale" SET DEFAULT '{en,th,cn}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "defaultLocale"`,
    );
    await queryRunner.query(`DROP TYPE "public"."merchant_defaultlocale_enum"`);
  }
}
