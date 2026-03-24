import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBannerTable1632238166058 implements MigrationInterface {
  name = 'CreateBannerTable1632238166058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "banner_merchant_desktop" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bannerMerchantId" integer, "imageUploadId" integer, CONSTRAINT "REL_5b9fd06efb7ca36ab26e3ab300" UNIQUE ("bannerMerchantId"), CONSTRAINT "PK_39a1673adf846377103116be7a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "banner_promotion_type_enum" AS ENUM('nonLink', 'blog', 'product', 'productCategory', 'productBrand', 'url')`,
    );
    await queryRunner.query(
      `CREATE TABLE "banner_promotion" ("id" SERIAL NOT NULL, "type" "banner_promotion_type_enum" NOT NULL, "isOpenNewWindow" boolean, "url" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "productId" integer, "productCategoryId" integer, "productBrandId" integer, "imageUploadId" integer, CONSTRAINT "PK_daa244a1287d2552d2f0e55e1cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "banner_merchant_type_enum" AS ENUM('nonLink', 'blog', 'product', 'productCategory', 'productBrand', 'url')`,
    );
    await queryRunner.query(
      `CREATE TABLE "banner_merchant" ("id" SERIAL NOT NULL, "type" "banner_merchant_type_enum" NOT NULL, "isOpenNewWindow" boolean, "url" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "productId" integer, "productCategoryId" integer, "productBrandId" integer, CONSTRAINT "PK_6c5088b1631417eb1159be9040f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "banner_merchant_application" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bannerMerchantId" integer, "imageUploadId" integer, CONSTRAINT "REL_f10f2a9dc44577525278a6383e" UNIQUE ("bannerMerchantId"), CONSTRAINT "PK_c13234c3cc58dec4f72c91b6f9b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_desktop" ADD CONSTRAINT "FK_5b9fd06efb7ca36ab26e3ab300f" FOREIGN KEY ("bannerMerchantId") REFERENCES "banner_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_desktop" ADD CONSTRAINT "FK_c5a1f03010abb8b13a0198b89b8" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_576c23cd387325239d8b288b307" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_6475b8a1cc773ac5a24fbda7528" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_90f8de6e692a32a11f2283f4d5c" FOREIGN KEY ("productCategoryId") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_11f68d59de455503299dec6bc65" FOREIGN KEY ("productBrandId") REFERENCES "product_brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_7ecbb26580cd14a7a53c4fd5895" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD CONSTRAINT "FK_2f107f21643be999bcd74a3dfc4" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD CONSTRAINT "FK_b3627f004ee6fb73ccbe8a4104f" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD CONSTRAINT "FK_c8cc6cfe3c5440f2ac79c91303a" FOREIGN KEY ("productCategoryId") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD CONSTRAINT "FK_68069a71fb6bbeeb12bb237c973" FOREIGN KEY ("productBrandId") REFERENCES "product_brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_application" ADD CONSTRAINT "FK_f10f2a9dc44577525278a6383e4" FOREIGN KEY ("bannerMerchantId") REFERENCES "banner_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_application" ADD CONSTRAINT "FK_d3a2ae173f5c82c705097e04260" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_application" DROP CONSTRAINT "FK_d3a2ae173f5c82c705097e04260"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_application" DROP CONSTRAINT "FK_f10f2a9dc44577525278a6383e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP CONSTRAINT "FK_68069a71fb6bbeeb12bb237c973"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP CONSTRAINT "FK_c8cc6cfe3c5440f2ac79c91303a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP CONSTRAINT "FK_b3627f004ee6fb73ccbe8a4104f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP CONSTRAINT "FK_2f107f21643be999bcd74a3dfc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_7ecbb26580cd14a7a53c4fd5895"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_11f68d59de455503299dec6bc65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_90f8de6e692a32a11f2283f4d5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_6475b8a1cc773ac5a24fbda7528"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_576c23cd387325239d8b288b307"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_desktop" DROP CONSTRAINT "FK_c5a1f03010abb8b13a0198b89b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant_desktop" DROP CONSTRAINT "FK_5b9fd06efb7ca36ab26e3ab300f"`,
    );
    await queryRunner.query(`DROP TABLE "banner_merchant_application"`);
    await queryRunner.query(`DROP TABLE "banner_merchant"`);
    await queryRunner.query(`DROP TYPE "banner_merchant_type_enum"`);
    await queryRunner.query(`DROP TABLE "banner_promotion"`);
    await queryRunner.query(`DROP TYPE "banner_promotion_type_enum"`);
    await queryRunner.query(`DROP TABLE "banner_merchant_desktop"`);
  }
}
