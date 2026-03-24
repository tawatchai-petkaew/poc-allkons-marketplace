import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugInMerchant1758774271118 implements MigrationInterface {
  name = 'AddSlugInMerchant1758774271118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_subdomainstatus_enum" AS ENUM('reserved', 'ready', 'active')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "subdomainStatus" "public"."merchant_subdomainstatus_enum" NOT NULL DEFAULT 'reserved'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "subdomainStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_subdomainstatus_enum"`,
    );
  }
}
