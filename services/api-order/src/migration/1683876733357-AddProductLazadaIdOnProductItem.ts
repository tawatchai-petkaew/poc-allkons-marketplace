import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductLazadaIdOnProductItem1683876733357
  implements MigrationInterface
{
  name = 'AddProductLazadaIdOnProductItem1683876733357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD "productItemIdLazada" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP COLUMN "productItemIdLazada"`,
    );
  }
}
