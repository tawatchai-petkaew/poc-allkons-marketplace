import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductLazadaTable1683865573764
  implements MigrationInterface {
  name = 'CreateProductLazadaTable1683865573764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_lazada" ("id" character varying NOT NULL, "created_time" character varying, "updated_time" character varying, "images" text, "skus" jsonb, "item_id" character varying, "hiddenStatus" character varying, "variation" jsonb, "trialProduct" boolean, "rejectReason" jsonb, "primary_category" character varying, "marketImages" text, "attributes" jsonb, "hiddenReason" character varying, "status" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, "merchantLazadaId" integer, CONSTRAINT "REL_c1b4cf66db47427624f4ea0c39" UNIQUE ("productId"), CONSTRAINT "PK_65ec5314875d64e232c006ecb27" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD "productLazadaId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD CONSTRAINT "FK_6acc8797d6e01dd1c8b23d92340" FOREIGN KEY ("productLazadaId") REFERENCES "product_lazada"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_lazada" ADD CONSTRAINT "FK_c1b4cf66db47427624f4ea0c391" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_lazada" ADD CONSTRAINT "FK_ea7b5d7d2c0d09e749259593ae1" FOREIGN KEY ("merchantLazadaId") REFERENCES "merchant_lazada"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_lazada" DROP CONSTRAINT "FK_ea7b5d7d2c0d09e749259593ae1"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_lazada" DROP CONSTRAINT "FK_c1b4cf66db47427624f4ea0c391"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP CONSTRAINT "FK_6acc8797d6e01dd1c8b23d92340"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP COLUMN "productLazadaId"`
    );
    await queryRunner.query(`DROP TABLE "product_lazada"`);
  }
}
