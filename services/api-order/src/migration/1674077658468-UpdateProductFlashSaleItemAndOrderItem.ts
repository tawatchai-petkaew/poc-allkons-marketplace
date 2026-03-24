import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductFlashSaleItemAndOrderItem1674077658468
  implements MigrationInterface
{
  name = 'UpdateProductFlashSaleItemAndOrderItem1674077658468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ADD "bigUnitSoldQuantity" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "bigUnitQuantity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ALTER COLUMN "price" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ALTER COLUMN "price" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ALTER COLUMN "price" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ALTER COLUMN "price" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "bigUnitQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" DROP COLUMN "bigUnitSoldQuantity"`,
    );
  }
}
