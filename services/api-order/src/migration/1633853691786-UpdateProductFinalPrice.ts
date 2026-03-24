import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductFinalPrice1633853691786
  implements MigrationInterface
{
  name = 'UpdateProductFinalPrice1633853691786';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "minFinalProductPrice" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "maxFinalProductPrice" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ALTER COLUMN "remaining" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" ALTER COLUMN "remaining" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "maxFinalProductPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "minFinalProductPrice"`,
    );
  }
}
