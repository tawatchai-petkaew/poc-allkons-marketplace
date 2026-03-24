import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTikTok1668011005693 implements MigrationInterface {
  name = 'CreateProductTikTok1668011005693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "product_tik_tok_product_status_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8')`
    );
    await queryRunner.query(
      `CREATE TABLE "product_tik_tok" ("id" character varying NOT NULL, "product_status" "product_tik_tok_product_status_enum" NOT NULL DEFAULT '1', "product_name" character varying NOT NULL, "description" character varying, "warranty_policy" character varying, "package_length" integer, "package_width" integer, "package_height" integer, "package_weight" character varying, "is_cod_open" boolean, "update_time" integer, "create_time" integer, "package_dimension_unit" character varying, "category_list" jsonb, "brand" jsonb, "images" jsonb, "video" jsonb, "warranty_period" jsonb, "skus" jsonb, "product_certifications" jsonb, "size_chart" jsonb, "product_attributes" jsonb, "qc_reasons" jsonb, "delivery_services" jsonb, "exemption_of_identifier_code" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, CONSTRAINT "REL_eb733ea781f4e89ce038972140" UNIQUE ("productId"), CONSTRAINT "PK_7310f1e4571899bf0999dffe65d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD CONSTRAINT "FK_eb733ea781f4e89ce0389721405" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP CONSTRAINT "FK_eb733ea781f4e89ce0389721405"`
    );
    await queryRunner.query(`DROP TABLE "product_tik_tok"`);
    await queryRunner.query(`DROP TYPE "product_tik_tok_product_status_enum"`);
  }
}
