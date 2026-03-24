import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHideProductPriceOnProduct1695346172939
  implements MigrationInterface
{
  name = 'AddHideProductPriceOnProduct1695346172939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "isHideProductPrice" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "isHideProductPrice"`,
    );
  }
}
