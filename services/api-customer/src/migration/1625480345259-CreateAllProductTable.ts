import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllProductTable1625480345259 implements MigrationInterface {
  name = 'CreateAllProductTable1625480345259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_image" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, "imageUploadId" integer, CONSTRAINT "PK_99d98a80f57857d51b5f63c8240" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_category_translation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "locale" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productCategoryId" integer, CONSTRAINT "PK_40ac21f239e150f3568da259974" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "product_category_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "product_category" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "status" "product_category_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "imageUploadId" integer, "merchantId" integer, CONSTRAINT "REL_33dc54b1fb7e745f0d353f936b" UNIQUE ("imageUploadId"), CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_brand_translation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "locale" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productBrandId" integer, CONSTRAINT "PK_a169adbc18801a92c0f22c82d51" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "product_brand_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "product_brand" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "status" "product_brand_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "imageUploadId" integer, "merchantId" integer, CONSTRAINT "REL_1f61ae18d5b19cb9812af216f9" UNIQUE ("imageUploadId"), CONSTRAINT "PK_2eb5ce4324613b4b457c364f4a2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_translation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "highlight" text, "description" text, "unit" character varying, "bigUnit" character varying, "color" text array, "size" text array, "locale" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, CONSTRAINT "PK_62d00fbc92e7a495701d6fee9d5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "product_discount_type_enum" AS ENUM('remain', 'decrease')`
    );
    await queryRunner.query(
      `CREATE TYPE "product_discount_unittype_enum" AS ENUM('bath', 'percent')`
    );
    await queryRunner.query(
      `CREATE TABLE "product_discount" ("id" SERIAL NOT NULL, "type" "product_discount_type_enum" NOT NULL DEFAULT 'decrease', "unitType" "product_discount_unittype_enum" NOT NULL DEFAULT 'bath', "value" integer NOT NULL, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_8cfd00cd6b9904ee7c5a45ffb3f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "product_type_enum" AS ENUM('available', 'draft', 'soon', 'discontinued')`
    );
    await queryRunner.query(
      `CREATE TYPE "product_relationstatus_enum" AS ENUM('onCategory', 'allCategory', 'custom')`
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "barCode" character varying, "videoUrl" character varying, "price" double precision NOT NULL DEFAULT '0', "isContainVAT" boolean, "cost" double precision DEFAULT '0', "piecePerBigUnit" integer, "weightSize" double precision NOT NULL DEFAULT '0', "widthSize" double precision NOT NULL DEFAULT '0', "lengthSize" double precision NOT NULL DEFAULT '0', "heightSize" double precision NOT NULL DEFAULT '0', "type" "product_type_enum" NOT NULL DEFAULT 'draft', "isRecommend" boolean, "isPopular" boolean, "isNew" boolean, "relationStatus" "product_relationstatus_enum" NOT NULL DEFAULT 'onCategory', "valueCustomRelationStatus" text array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productCategoryId" integer, "productBrandId" integer, "merchantId" integer, "productDiscountId" integer, CONSTRAINT "REL_7d47a6c8b551bc4b9f486712f7" UNIQUE ("productDiscountId"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "stock_transaction_type_enum" AS ENUM('increase', 'decrease')`
    );
    await queryRunner.query(
      `CREATE TABLE "stock_transaction" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "type" "stock_transaction_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "stockId" integer, CONSTRAINT "PK_8a81a89b9130bda3a5277cce53a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "stock" ("id" SERIAL NOT NULL, "remaining" integer NOT NULL, "isServiceProduct" boolean NOT NULL, "onValidateStock" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, "merchantId" integer, CONSTRAINT "REL_e855a71c31948188c2bf78824a" UNIQUE ("productId"), CONSTRAINT "PK_092bc1fc7d860426a1dec5aa8e9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD CONSTRAINT "FK_40ca0cd115ef1ff35351bed8da2" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD CONSTRAINT "FK_cfa91efa066f7c3ba5ebc0b03cf" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_category_translation" ADD CONSTRAINT "FK_bb20f3c019f10d27c101d65da43" FOREIGN KEY ("productCategoryId") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_33dc54b1fb7e745f0d353f936b6" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_7bfd0d8fd3100e75d5b4bf7b545" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand_translation" ADD CONSTRAINT "FK_03a73d61e70ba54e5ec18a1ac47" FOREIGN KEY ("productBrandId") REFERENCES "product_brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" ADD CONSTRAINT "FK_1f61ae18d5b19cb9812af216f9c" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" ADD CONSTRAINT "FK_97aa72ef86a934d1d31d4584428" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_translation" ADD CONSTRAINT "FK_77562fa6f960ba7268ff8e306f3" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_618194d24a7ea86a165d7ec628e" FOREIGN KEY ("productCategoryId") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_772bf6e6c3758c254f2db19ada2" FOREIGN KEY ("productBrandId") REFERENCES "product_brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_62fcc319202f6ec1f6819e1d5f5" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_7d47a6c8b551bc4b9f486712f7f" FOREIGN KEY ("productDiscountId") REFERENCES "product_discount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_9e595a192624e946b315a92bdbb" FOREIGN KEY ("stockId") REFERENCES "stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "FK_e855a71c31948188c2bf78824a5" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "FK_10c4f7c6c4071bd80a04d48eaf5" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "FK_10c4f7c6c4071bd80a04d48eaf5"`
    );
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "FK_e855a71c31948188c2bf78824a5"`
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_9e595a192624e946b315a92bdbb"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_7d47a6c8b551bc4b9f486712f7f"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_62fcc319202f6ec1f6819e1d5f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_772bf6e6c3758c254f2db19ada2"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_618194d24a7ea86a165d7ec628e"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_translation" DROP CONSTRAINT "FK_77562fa6f960ba7268ff8e306f3"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" DROP CONSTRAINT "FK_97aa72ef86a934d1d31d4584428"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" DROP CONSTRAINT "FK_1f61ae18d5b19cb9812af216f9c"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand_translation" DROP CONSTRAINT "FK_03a73d61e70ba54e5ec18a1ac47"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_7bfd0d8fd3100e75d5b4bf7b545"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_33dc54b1fb7e745f0d353f936b6"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_category_translation" DROP CONSTRAINT "FK_bb20f3c019f10d27c101d65da43"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP CONSTRAINT "FK_cfa91efa066f7c3ba5ebc0b03cf"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP CONSTRAINT "FK_40ca0cd115ef1ff35351bed8da2"`
    );
    await queryRunner.query(`DROP TABLE "stock"`);
    await queryRunner.query(`DROP TABLE "stock_transaction"`);
    await queryRunner.query(`DROP TYPE "stock_transaction_type_enum"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TYPE "product_relationstatus_enum"`);
    await queryRunner.query(`DROP TYPE "product_type_enum"`);
    await queryRunner.query(`DROP TABLE "product_discount"`);
    await queryRunner.query(`DROP TYPE "product_discount_unittype_enum"`);
    await queryRunner.query(`DROP TYPE "product_discount_type_enum"`);
    await queryRunner.query(`DROP TABLE "product_translation"`);
    await queryRunner.query(`DROP TABLE "product_brand"`);
    await queryRunner.query(`DROP TYPE "product_brand_status_enum"`);
    await queryRunner.query(`DROP TABLE "product_brand_translation"`);
    await queryRunner.query(`DROP TABLE "product_category"`);
    await queryRunner.query(`DROP TYPE "product_category_status_enum"`);
    await queryRunner.query(`DROP TABLE "product_category_translation"`);
    await queryRunner.query(`DROP TABLE "product_image"`);
  }
}
