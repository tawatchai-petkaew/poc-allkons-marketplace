import { MigrationInterface, QueryRunner } from 'typeorm';

export class createShopeeEntities1670276364353 implements MigrationInterface {
  name = 'createShopeeEntities1670276364353';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_sync_shopee_status_enum" AS ENUM('pending', 'failed', 'successful')`
    );
    await queryRunner.query(
      `CREATE TABLE "order_sync_shopee" ("id" SERIAL NOT NULL, "status" "order_sync_shopee_status_enum" NOT NULL DEFAULT 'pending', "merchantShopeeId" character varying, CONSTRAINT "PK_81c63a1a16750be4fb469d08641" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_shopee" ("id" character varying NOT NULL, "code" character varying, "partner_id" character varying NOT NULL, "signData" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "access_token" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL, "refresh_token" character varying NOT NULL, "merchantId" integer, CONSTRAINT "UQ_2a085173136b019c66ec01bb548" UNIQUE ("id"), CONSTRAINT "UQ_bb37f54441cafac1096ee93437a" UNIQUE ("access_token"), CONSTRAINT "UQ_3964a02fcbbf15306259b53e568" UNIQUE ("refresh_token"), CONSTRAINT "REL_9d3ab7e91bb52bd97e289f18d9" UNIQUE ("merchantId"), CONSTRAINT "PK_2a085173136b019c66ec01bb548" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_shopee" ("id" character varying NOT NULL, "data" jsonb NOT NULL, "sku" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantShopeeId" character varying, "productId" integer, CONSTRAINT "UQ_2aa884cc6f9ecb9e22b638e04c3" UNIQUE ("sku"), CONSTRAINT "REL_54464f4bbd53f13128016addd3" UNIQUE ("productId"), CONSTRAINT "PK_dfad39cad807fee2e071e5c826a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "order_sync_shopee" ADD CONSTRAINT "FK_9c737aaf9b4c0f7d68ecda1aeef" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "FK_9d3ab7e91bb52bd97e289f18d98" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_54464f4bbd53f13128016addd3c" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_54464f4bbd53f13128016addd3c"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "FK_9d3ab7e91bb52bd97e289f18d98"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_sync_shopee" DROP CONSTRAINT "FK_9c737aaf9b4c0f7d68ecda1aeef"`
    );
    await queryRunner.query(`DROP TABLE "product_shopee"`);
    await queryRunner.query(`DROP TABLE "merchant_shopee"`);
    await queryRunner.query(`DROP TABLE "order_sync_shopee"`);
    await queryRunner.query(`DROP TYPE "order_sync_shopee_status_enum"`);
  }
}
