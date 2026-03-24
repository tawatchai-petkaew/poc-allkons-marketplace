import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameNameColumnsInProductShopee1671368274016
  implements MigrationInterface
{
  name = 'renameNameColumnsInProductShopee1671368274016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_54464f4bbd53f13128016addd3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "merchantShopeeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "REL_54464f4bbd53f13128016addd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "merchant_shopee_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "product_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "UQ_d98d2e18301ec6952f024d90ce1" UNIQUE ("product_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "UQ_dfad39cad807fee2e071e5c826a" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_a0a0c5397b28529ed61129149ad" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_d98d2e18301ec6952f024d90ce1" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_d98d2e18301ec6952f024d90ce1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_a0a0c5397b28529ed61129149ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "UQ_dfad39cad807fee2e071e5c826a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "UQ_d98d2e18301ec6952f024d90ce1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "merchant_shopee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "productId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "REL_54464f4bbd53f13128016addd3" UNIQUE ("productId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "merchantShopeeId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_54464f4bbd53f13128016addd3c" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
