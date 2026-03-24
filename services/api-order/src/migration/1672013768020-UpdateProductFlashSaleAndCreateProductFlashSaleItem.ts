import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductFlashSaleAndCreateProductFlashSaleItem1672013768020
  implements MigrationInterface
{
  name = 'UpdateProductFlashSaleAndCreateProductFlashSaleItem1672013768020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_flash_sale_item" ("id" SERIAL NOT NULL, "slug" character varying, "price" double precision NOT NULL DEFAULT '0', "bigUnitPrice" double precision, "soldQuantity" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productFlashSaleId" integer, "productItemId" integer, CONSTRAINT "PK_d8cbdeb2d5c421bf3548303c1b5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" DROP COLUMN "soldQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "productFlashSaleItemId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ADD CONSTRAINT "FK_5481684d29474b68cbaa32d3b35" FOREIGN KEY ("productFlashSaleId") REFERENCES "product_flash_sale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" ADD CONSTRAINT "FK_b55e99f68866a5467fd41d0e636" FOREIGN KEY ("productItemId") REFERENCES "product_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_8f264518a9b05817c0ffe6dce16" FOREIGN KEY ("productFlashSaleItemId") REFERENCES "product_flash_sale_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_8f264518a9b05817c0ffe6dce16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" DROP CONSTRAINT "FK_b55e99f68866a5467fd41d0e636"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale_item" DROP CONSTRAINT "FK_5481684d29474b68cbaa32d3b35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "productFlashSaleItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" ADD "soldQuantity" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`DROP TABLE "product_flash_sale_item"`);
  }
}
