import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSoldQuantityOnProductItem1633404362837
  implements MigrationInterface
{
  name = 'UpdateSoldQuantityOnProductItem1633404362837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "soldQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD "soldQuantity" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" ADD "quantity" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" ADD "quantity" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP COLUMN "soldQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "soldQuantity" integer NOT NULL DEFAULT '0'`,
    );
  }
}
