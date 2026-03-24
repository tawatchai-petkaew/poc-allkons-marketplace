import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantWallet1711949458743 implements MigrationInterface {
  name = 'AddMerchantWallet1711949458743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shopdit_product" ("id" SERIAL NOT NULL, "slug" character varying, "name" character varying NOT NULL, "value" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f70804f3c9bc41e6204ab400a40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_wallet_order_item_orderitemtype_enum" AS ENUM('feature')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_wallet_order_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "value" double precision NOT NULL DEFAULT '0', "productItemSlug" character varying, "productItemName" character varying, "orderItemType" "public"."merchant_wallet_order_item_orderitemtype_enum" NOT NULL DEFAULT 'feature', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shopditProductId" integer, "merchantWalletOrderId" integer, CONSTRAINT "PK_32765c4c82e999d9d5ec8d4fa78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_wallet_order_status_enum" AS ENUM('pending', 'success', 'cancel')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_wallet_order_ordertype_enum" AS ENUM('feature')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_wallet_order" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "totalValue" double precision NOT NULL DEFAULT '0', "status" "public"."merchant_wallet_order_status_enum" NOT NULL DEFAULT 'pending', "orderedAt" TIMESTAMP NOT NULL, "orderType" "public"."merchant_wallet_order_ordertype_enum" NOT NULL DEFAULT 'feature', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f3a5eb0727565907061e3c48b3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_wallet_transaction_type_enum" AS ENUM('increase', 'decrease')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_wallet_transaction" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "type" "public"."merchant_wallet_transaction_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantWalletId" integer, "merchantWalletOrderId" integer, CONSTRAINT "REL_fbc50f8438be32903d871d3338" UNIQUE ("merchantWalletOrderId"), CONSTRAINT "PK_c2d0e4ecf34ce20a2445c2a65ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_wallet_wallettype_enum" AS ENUM('normal', 'unlimited')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_wallet" ("id" SERIAL NOT NULL, "total" integer NOT NULL DEFAULT '0', "remaining" integer NOT NULL DEFAULT '0', "used" integer NOT NULL DEFAULT '0', "walletType" "public"."merchant_wallet_wallettype_enum" NOT NULL DEFAULT 'normal', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_9d446989cd641ac86a3c027a37" UNIQUE ("merchantId"), CONSTRAINT "PK_bcb3159ecf6c1850c860d110aee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditProductWhitelist" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_order_item" ADD CONSTRAINT "FK_338f8b380e476238bc34d8cedf2" FOREIGN KEY ("shopditProductId") REFERENCES "shopdit_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_order_item" ADD CONSTRAINT "FK_d933e627410476929cec14221d1" FOREIGN KEY ("merchantWalletOrderId") REFERENCES "merchant_wallet_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_transaction" ADD CONSTRAINT "FK_d46c3f54c3d588b583790d191f4" FOREIGN KEY ("merchantWalletId") REFERENCES "merchant_wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_transaction" ADD CONSTRAINT "FK_fbc50f8438be32903d871d33384" FOREIGN KEY ("merchantWalletOrderId") REFERENCES "merchant_wallet_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet" ADD CONSTRAINT "FK_9d446989cd641ac86a3c027a37a" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet" DROP CONSTRAINT "FK_9d446989cd641ac86a3c027a37a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_transaction" DROP CONSTRAINT "FK_fbc50f8438be32903d871d33384"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_transaction" DROP CONSTRAINT "FK_d46c3f54c3d588b583790d191f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_order_item" DROP CONSTRAINT "FK_d933e627410476929cec14221d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_wallet_order_item" DROP CONSTRAINT "FK_338f8b380e476238bc34d8cedf2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditProductWhitelist"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_wallet"`);
    await queryRunner.query(
      `DROP TYPE "public"."merchant_wallet_wallettype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_wallet_transaction"`);
    await queryRunner.query(
      `DROP TYPE "public"."merchant_wallet_transaction_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_wallet_order"`);
    await queryRunner.query(
      `DROP TYPE "public"."merchant_wallet_order_ordertype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_wallet_order_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_wallet_order_item"`);
    await queryRunner.query(
      `DROP TYPE "public"."merchant_wallet_order_item_orderitemtype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "shopdit_product"`);
  }
}
