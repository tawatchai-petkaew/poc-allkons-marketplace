import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDefaultLocale1692003619227 implements MigrationInterface {
  name = 'UpdateDefaultLocale1692003619227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "availableLocale" SET DEFAULT '{en,th,zh_CN,zh_TW,fr,es}'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_defaultlocale_enum" RENAME TO "merchant_defaultlocale_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_defaultlocale_enum" AS ENUM('th', 'en', 'cn', 'tw', 'zh_TW', 'zh_CN', 'fr', 'es')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "defaultLocale" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "defaultLocale" TYPE "public"."merchant_defaultlocale_enum" USING "defaultLocale"::"text"::"public"."merchant_defaultlocale_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "defaultLocale" SET DEFAULT 'th'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_defaultlocale_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_locale_enum" RENAME TO "user_locale_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_locale_enum" AS ENUM('th', 'en', 'cn', 'tw', 'zh_TW', 'zh_CN', 'fr', 'es')`,
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
      `CREATE TYPE "public"."user_locale_enum_old" AS ENUM('th', 'en', 'cn', 'tw', 'zh_TW', 'zh_CN')`,
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
      `CREATE TYPE "public"."merchant_defaultlocale_enum_old" AS ENUM('th', 'en', 'cn', 'tw', 'zh_TW', 'zh_CN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "defaultLocale" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "defaultLocale" TYPE "public"."merchant_defaultlocale_enum_old" USING "defaultLocale"::"text"::"public"."merchant_defaultlocale_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "defaultLocale" SET DEFAULT 'th'`,
    );
    await queryRunner.query(`DROP TYPE "public"."merchant_defaultlocale_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_defaultlocale_enum_old" RENAME TO "merchant_defaultlocale_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "availableLocale" SET DEFAULT '{en,th,zh_CN,zh_TW}'`,
    );
  }
}
