import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCatalogTable1659416362931
  implements MigrationInterface
{
  name = 'CreateProductCatalogTable1659416362931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_product_catalog" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, "productCatalogId" integer, CONSTRAINT "PK_dadbaec28a1a037d64345f4489f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "product_catalog_status_enum" AS ENUM('active', 'inActive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "product_catalog_mainstatus_enum" AS ENUM('primary', 'secondary')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_catalog" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "status" "product_catalog_status_enum" NOT NULL DEFAULT 'active', "mainStatus" "product_catalog_mainstatus_enum" NOT NULL DEFAULT 'secondary', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "imageUploadId" integer, CONSTRAINT "PK_43fc6ce23925dbaa92fea160f71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD "productCatalogId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD "productCatalogId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_product_catalog" ADD CONSTRAINT "FK_3c12fb0511983f1b72043f4dc0e" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_product_catalog" ADD CONSTRAINT "FK_be46481ed27d3cd1336f9690e1d" FOREIGN KEY ("productCatalogId") REFERENCES "product_catalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" ADD CONSTRAINT "FK_fe0aff21d7d05fc0813f0d19646" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" ADD CONSTRAINT "FK_293fdc87fd4efbfe66a5d1725f6" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_24db1f72e386d3b0f6f45599d19" FOREIGN KEY ("productCatalogId") REFERENCES "product_catalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD CONSTRAINT "FK_0251f0ecd5197e99c25425ffc74" FOREIGN KEY ("productCatalogId") REFERENCES "product_catalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP CONSTRAINT "FK_0251f0ecd5197e99c25425ffc74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_24db1f72e386d3b0f6f45599d19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT "FK_293fdc87fd4efbfe66a5d1725f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_catalog" DROP CONSTRAINT "FK_fe0aff21d7d05fc0813f0d19646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_product_catalog" DROP CONSTRAINT "FK_be46481ed27d3cd1336f9690e1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_product_catalog" DROP CONSTRAINT "FK_3c12fb0511983f1b72043f4dc0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP COLUMN "productCatalogId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP COLUMN "productCatalogId"`,
    );
    await queryRunner.query(`DROP TABLE "product_catalog"`);
    await queryRunner.query(`DROP TYPE "product_catalog_mainstatus_enum"`);
    await queryRunner.query(`DROP TYPE "product_catalog_status_enum"`);
    await queryRunner.query(`DROP TABLE "product_product_catalog"`);
  }
}
