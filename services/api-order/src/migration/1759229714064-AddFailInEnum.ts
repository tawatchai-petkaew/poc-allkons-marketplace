import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFailInEnum1759229714064 implements MigrationInterface {
  name = 'AddFailInEnum1759229714064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_subdomainstatus_enum" RENAME TO "merchant_subdomainstatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_subdomainstatus_enum" AS ENUM('reserved', 'ready', 'active', 'fail')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "subdomainStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "subdomainStatus" TYPE "public"."merchant_subdomainstatus_enum" USING "subdomainStatus"::"text"::"public"."merchant_subdomainstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "subdomainStatus" SET DEFAULT 'reserved'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_subdomainstatus_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_subdomainstatus_enum_old" AS ENUM('active', 'ready', 'reserved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "subdomainStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "subdomainStatus" TYPE "public"."merchant_subdomainstatus_enum_old" USING "subdomainStatus"::"text"::"public"."merchant_subdomainstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ALTER COLUMN "subdomainStatus" SET DEFAULT 'reserved'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_subdomainstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_subdomainstatus_enum_old" RENAME TO "merchant_subdomainstatus_enum"`,
    );
  }
}
