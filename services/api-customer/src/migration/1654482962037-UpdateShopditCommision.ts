import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateShopditCommision1654482962037 implements MigrationInterface {
  name = 'UpdateShopditCommision1654482962037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_revenue_statement_paymentmethod_enum" AS ENUM('shopditpay', 'nonShopditpay')`
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_revenue_statement_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'omise', 'paypal', 'shopditpayCreditCard', 'shopditpayLinepay', 'shopditpayAirpay', 'shopditpayScbEasy', 'shopditpayBbl', 'shopditpayBaybank', 'shopditpayTruemoney')`
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_revenue_statement_orderchannel_enum" AS ENUM('mobileWebsite', 'IosApp', 'AndroidApp', 'desktopWebsite', 'admin')`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_revenue_statement" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "paymentMethod" "merchant_revenue_statement_paymentmethod_enum", "paymentMethodType" "merchant_revenue_statement_paymentmethodtype_enum", "orderNumber" character varying NOT NULL, "orderedAt" TIMESTAMP NOT NULL, "orderChannel" "merchant_revenue_statement_orderchannel_enum", "orderTotalPrice" double precision NOT NULL DEFAULT '0', "shopditPayCommisionCost" double precision NOT NULL DEFAULT '0', "platformCommisionCost" double precision NOT NULL DEFAULT '0', "discountCommisionCost" double precision NOT NULL DEFAULT '0', "totalReceive" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "UQ_b449f080d3f057cc252c4edf8cc" UNIQUE ("number"), CONSTRAINT "PK_e90a4a228a793282b185c8a0b52" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditPayCommission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "discountCommission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "marketplaceCommission"`
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "commission"`);
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditPayCommission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "discountCommission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "marketplaceCommission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "commission"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "commision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "marketplaceCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "discountCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "platformCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayCreditCardCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayLinepayCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayAirpayCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayScbEasyCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayBblCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayBaybankCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditpayTruemoneyCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "commision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "marketplaceCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "discountCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "platformCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayCreditCardCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayLinepayCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayAirpayCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayScbEasyCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayBblCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayBaybankCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditpayTruemoneyCommision" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" ADD CONSTRAINT "FK_cd7f2287526f5c51d471b2ef250" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_revenue_statement" DROP CONSTRAINT "FK_cd7f2287526f5c51d471b2ef250"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayTruemoneyCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayBaybankCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayBblCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayScbEasyCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayAirpayCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayLinepayCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "shopditpayCreditCardCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "platformCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "discountCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "marketplaceCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "commision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayTruemoneyCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayBaybankCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayBblCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayScbEasyCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayAirpayCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayLinepayCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditpayCreditCardCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "platformCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "discountCommision"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "marketplaceCommision"`
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "commision"`);
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "commission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "marketplaceCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "discountCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "shopditPayCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "commission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "marketplaceCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "discountCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditPayCommission" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(`DROP TABLE "merchant_revenue_statement"`);
    await queryRunner.query(
      `DROP TYPE "merchant_revenue_statement_orderchannel_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "merchant_revenue_statement_paymentmethodtype_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "merchant_revenue_statement_paymentmethod_enum"`
    );
  }
}
