import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFlashSaleTable1633334048995 implements MigrationInterface {
  name = 'CreateFlashSaleTable1633334048995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "flash_sale_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "flash_sale" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "status" "flash_sale_status_enum" NOT NULL DEFAULT 'inActive', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_0ca3636f18f85dce0d2b800a7fb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_flash_sale" ("id" SERIAL NOT NULL, "quantity" character varying NOT NULL, "soldQuantity" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, "flashSaleId" integer, CONSTRAINT "PK_5321bd158b08612e7c401d1ef1d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "soldQuantity" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "price" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "productFlashSaleId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "flash_sale" ADD CONSTRAINT "FK_dff47a66b0e77015e8adba8e41f" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" ADD CONSTRAINT "FK_e2c8cebd14781e6583a5fc2ea8e" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" ADD CONSTRAINT "FK_c48d61d5d5b1e585493cd04a815" FOREIGN KEY ("flashSaleId") REFERENCES "flash_sale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_10a230eb33803180f3e5ef9c0f4" FOREIGN KEY ("productFlashSaleId") REFERENCES "product_flash_sale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_10a230eb33803180f3e5ef9c0f4"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" DROP CONSTRAINT "FK_c48d61d5d5b1e585493cd04a815"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" DROP CONSTRAINT "FK_e2c8cebd14781e6583a5fc2ea8e"`
    );
    await queryRunner.query(
      `ALTER TABLE "flash_sale" DROP CONSTRAINT "FK_dff47a66b0e77015e8adba8e41f"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "productFlashSaleId"`
    );
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "soldQuantity"`
    );
    await queryRunner.query(`DROP TABLE "product_flash_sale"`);
    await queryRunner.query(`DROP TABLE "flash_sale"`);
    await queryRunner.query(`DROP TYPE "flash_sale_status_enum"`);
  }
}
