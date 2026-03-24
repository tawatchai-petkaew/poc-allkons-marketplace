import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeNameShopeeId1682532598466 implements MigrationInterface {
  name = 'ChangeNameShopeeId1682532598466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_d98d2e18301ec6952f024d90ce1"`
    );
    await queryRunner.query(
      `CREATE TABLE "base_shopee_entity" ("id" character varying NOT NULL, "shopee_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_cf6e91fddb388e7835d1f2bc43e" UNIQUE ("id"), CONSTRAINT "PK_cf6e91fddb388e7835d1f2bc43e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "product_shopee_item" ("id" character varying NOT NULL, "shopee_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "data" jsonb NOT NULL, "product_item_id" integer, "linked_at" TIMESTAMP, "product_shopee_id" character varying, "merchant_shopee_id" character varying, CONSTRAINT "UQ_1205cb6dc6911daabfa6813d54e" UNIQUE ("id"), CONSTRAINT "PK_1205cb6dc6911daabfa6813d54e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "shopee_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "UQ_3874d5cc43a9d2aa3f9f26c262f" UNIQUE ("shopee_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "shopee_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "linked_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "sale" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "UQ_bb37f54441cafac1096ee93437a"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "UQ_3964a02fcbbf15306259b53e568"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ALTER COLUMN "sku" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "UQ_d98d2e18301ec6952f024d90ce1"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" ADD CONSTRAINT "FK_4804679303bd4441296a595adbe" FOREIGN KEY ("product_shopee_id") REFERENCES "product_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" ADD CONSTRAINT "FK_762761701ca79dc71af26ed33e7" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" DROP CONSTRAINT "FK_762761701ca79dc71af26ed33e7"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" DROP CONSTRAINT "FK_4804679303bd4441296a595adbe"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "UQ_d98d2e18301ec6952f024d90ce1" UNIQUE ("product_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ALTER COLUMN "sku" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "UQ_3964a02fcbbf15306259b53e568" UNIQUE ("refresh_token")`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "UQ_bb37f54441cafac1096ee93437a" UNIQUE ("access_token")`
    );
    await queryRunner.query(`ALTER TABLE "product_shopee" DROP COLUMN "sale"`);
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "linked_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "shopee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "UQ_3874d5cc43a9d2aa3f9f26c262f"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "shopee_id"`
    );
    await queryRunner.query(`DROP TABLE "product_shopee_item"`);
    await queryRunner.query(`DROP TABLE "base_shopee_entity"`);
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_d98d2e18301ec6952f024d90ce1" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
