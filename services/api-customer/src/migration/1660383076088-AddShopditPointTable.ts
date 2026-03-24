import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopditPointTable1660383076088 implements MigrationInterface {
  name = 'AddShopditPointTable1660383076088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_wallet_transaction_valuetype_enum" AS ENUM('shopditPoint')`
    );
    await queryRunner.query(
      `CREATE TYPE "customer_wallet_transaction_type_enum" AS ENUM('increase', 'decrease')`
    );
    await queryRunner.query(
      `CREATE TABLE "customer_wallet_transaction" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "valueType" "customer_wallet_transaction_valuetype_enum" NOT NULL, "type" "customer_wallet_transaction_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerWalletId" integer, CONSTRAINT "PK_6d958e68455999f923ecec1d552" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "customer_wallet_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "customer_wallet" ("id" SERIAL NOT NULL, "status" "customer_wallet_status_enum" NOT NULL DEFAULT 'active', "shopditPoint" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, CONSTRAINT "REL_dbee9d68095f047c35f9f8c88b" UNIQUE ("customerId"), CONSTRAINT "PK_d72b4879e23dbcf65a3781ce5c3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_shopdit_point_configuration" ("id" SERIAL NOT NULL, "isActiveEarnPoint" boolean NOT NULL DEFAULT true, "valueToEarnOnePoint" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_c1ecc216aa61f80b51ef5d3757" UNIQUE ("merchantId"), CONSTRAINT "PK_e4b56ce29f51f060f18d62095b4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "shopditPoint" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet_transaction" ADD CONSTRAINT "FK_97c95b3b78e52c431a0e5891273" FOREIGN KEY ("customerWalletId") REFERENCES "customer_wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet" ADD CONSTRAINT "FK_dbee9d68095f047c35f9f8c88b9" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopdit_point_configuration" ADD CONSTRAINT "FK_c1ecc216aa61f80b51ef5d37571" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopdit_point_configuration" DROP CONSTRAINT "FK_c1ecc216aa61f80b51ef5d37571"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet" DROP CONSTRAINT "FK_dbee9d68095f047c35f9f8c88b9"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet_transaction" DROP CONSTRAINT "FK_97c95b3b78e52c431a0e5891273"`
    );
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "shopditPoint"`);
    await queryRunner.query(
      `DROP TABLE "merchant_shopdit_point_configuration"`
    );
    await queryRunner.query(`DROP TABLE "customer_wallet"`);
    await queryRunner.query(`DROP TYPE "customer_wallet_status_enum"`);
    await queryRunner.query(`DROP TABLE "customer_wallet_transaction"`);
    await queryRunner.query(
      `DROP TYPE "customer_wallet_transaction_type_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "customer_wallet_transaction_valuetype_enum"`
    );
  }
}
