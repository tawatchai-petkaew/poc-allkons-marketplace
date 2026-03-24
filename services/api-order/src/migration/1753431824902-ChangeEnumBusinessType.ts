import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEnumBusinessType1753431824902 implements MigrationInterface {
  name = 'ChangeEnumBusinessType1753431824902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."organization_businesstype_enum" RENAME TO "organization_businesstype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_businesstype_enum" AS ENUM('AGENT', 'BIXBOX', 'MDT', 'ONL', 'FAC', 'CON', 'CH', 'DVP', 'DVP_HOTEL', 'DVP_CONNDO', 'DVP_APT', 'DVP_DOR', 'DVP_SC', 'DVP_GASSTATION', 'DVP_AHD', 'ARC', 'ARC_LND_ARC', 'ARC_ARC', 'ARC_ID', 'ARC_PD', 'ENG', 'ENG_CE', 'ENG_ENV', 'ENG_ME', 'ENG_EC', 'IGFA', 'IGFA_CN', 'IGFA_ID', 'IGFA_VN', 'IGFA_OTHER', 'BANK', 'NONE_BANK', 'GIL', 'OTHER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "businessType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "businessType" TYPE "public"."organization_businesstype_enum"[] USING "businessType"::"text"::"public"."organization_businesstype_enum"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "businessType" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_businesstype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_businesstype_enum" RENAME TO "user_businesstype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_businesstype_enum" AS ENUM('AGENT', 'BIXBOX', 'MDT', 'ONL', 'FAC', 'CON', 'CH', 'DVP', 'DVP_HOTEL', 'DVP_CONNDO', 'DVP_APT', 'DVP_DOR', 'DVP_SC', 'DVP_GASSTATION', 'DVP_AHD', 'ARC', 'ARC_LND_ARC', 'ARC_ARC', 'ARC_ID', 'ARC_PD', 'ENG', 'ENG_CE', 'ENG_ENV', 'ENG_ME', 'ENG_EC', 'IGFA', 'IGFA_CN', 'IGFA_ID', 'IGFA_VN', 'IGFA_OTHER', 'BANK', 'NONE_BANK', 'GIL', 'OTHER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "businessType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "businessType" TYPE "public"."user_businesstype_enum"[] USING "businessType"::"text"::"public"."user_businesstype_enum"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "businessType" SET DEFAULT '{}'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_businesstype_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_businesstype_enum_old" AS ENUM('AGENT', 'BIXBOX', 'CH', 'CON', 'FAC', 'MDT', 'ONL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "businessType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "businessType" TYPE "public"."user_businesstype_enum_old"[] USING "businessType"::"text"::"public"."user_businesstype_enum_old"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "businessType" SET DEFAULT '{}'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_businesstype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_businesstype_enum_old" RENAME TO "user_businesstype_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_businesstype_enum_old" AS ENUM('AGENT', 'BIXBOX', 'CH', 'CON', 'FAC', 'MDT', 'ONL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "businessType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "businessType" TYPE "public"."organization_businesstype_enum_old"[] USING "businessType"::"text"::"public"."organization_businesstype_enum_old"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "businessType" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_businesstype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_businesstype_enum_old" RENAME TO "organization_businesstype_enum"`,
    );
  }
}
