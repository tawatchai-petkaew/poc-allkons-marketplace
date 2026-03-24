import { MigrationInterface, QueryRunner } from 'typeorm';

export class isNoBrandOnProductBrand1664853329104
  implements MigrationInterface
{
  name = 'isNoBrandOnProductBrand1664853329104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_brand" ADD "isNoBrand" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_brand" DROP COLUMN "isNoBrand"`,
    );
  }
}
