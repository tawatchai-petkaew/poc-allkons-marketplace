import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductItemTableAndUpdateProductTable1632795388416
  implements MigrationInterface
{
  name = 'CreateProductItemTableAndUpdateProductTable1632795388416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_7d47a6c8b551bc4b9f486712f7f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "FK_e855a71c31948188c2bf78824a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_primary_option" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "options" text array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_3b375938a111936f56ef3be57fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_secondary_option" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "options" text array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bd09bb3d4cd65cac67e6599fc23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_item" ("id" SERIAL NOT NULL, "slug" character varying, "primaryOptionsValue" character varying, "secondaryOptionsValue" character varying, "price" double precision NOT NULL DEFAULT '0', "cost" double precision DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "imageUploadId" integer, "productId" integer, "productDiscountId" integer, CONSTRAINT "REL_61552bd2d468bc4158ff955540" UNIQUE ("productDiscountId"), CONSTRAINT "PK_83c3b7a80f6fe1d5ad7fa05a2a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_translation" DROP COLUMN "color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_translation" DROP COLUMN "size"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isContainVAT"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "cost"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "REL_7d47a6c8b551bc4b9f486712f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "productDiscountId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "REL_e855a71c31948188c2bf78824a"`,
    );
    await queryRunner.query(`ALTER TABLE "stock" DROP COLUMN "productId"`);
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "productId"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "productPrimaryOptionId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_5fd709edaf1c67fbd0e852534fc" UNIQUE ("productPrimaryOptionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "productSecondaryOptionId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_fcf5c4d74f66848fe245ba9abc1" UNIQUE ("productSecondaryOptionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD CONSTRAINT "FK_8532c9a0f8075dd926cdc0f40ad" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD CONSTRAINT "FK_5be351f01d190ba6c78adc013a9" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD CONSTRAINT "FK_61552bd2d468bc4158ff955540c" FOREIGN KEY ("productDiscountId") REFERENCES "product_discount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_5fd709edaf1c67fbd0e852534fc" FOREIGN KEY ("productPrimaryOptionId") REFERENCES "product_primary_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_fcf5c4d74f66848fe245ba9abc1" FOREIGN KEY ("productSecondaryOptionId") REFERENCES "product_secondary_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_fcf5c4d74f66848fe245ba9abc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_5fd709edaf1c67fbd0e852534fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP CONSTRAINT "FK_61552bd2d468bc4158ff955540c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP CONSTRAINT "FK_5be351f01d190ba6c78adc013a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP CONSTRAINT "FK_8532c9a0f8075dd926cdc0f40ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_fcf5c4d74f66848fe245ba9abc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "productSecondaryOptionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_5fd709edaf1c67fbd0e852534fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "productPrimaryOptionId"`,
    );
    await queryRunner.query(`ALTER TABLE "order_item" ADD "productId" integer`);
    await queryRunner.query(`ALTER TABLE "stock" ADD "productId" integer`);
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "REL_e855a71c31948188c2bf78824a" UNIQUE ("productId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "productDiscountId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "REL_7d47a6c8b551bc4b9f486712f7" UNIQUE ("productDiscountId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "cost" double precision DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "product" ADD "isContainVAT" boolean`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "price" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_translation" ADD "size" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_translation" ADD "color" text array`,
    );
    await queryRunner.query(`DROP TABLE "product_item"`);
    await queryRunner.query(`DROP TABLE "product_secondary_option"`);
    await queryRunner.query(`DROP TABLE "product_primary_option"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "FK_e855a71c31948188c2bf78824a5" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_7d47a6c8b551bc4b9f486712f7f" FOREIGN KEY ("productDiscountId") REFERENCES "product_discount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
