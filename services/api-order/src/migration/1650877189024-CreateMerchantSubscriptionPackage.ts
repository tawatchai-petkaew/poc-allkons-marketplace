import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantSubscriptionPackage1650877189024
  implements MigrationInterface
{
  name = 'CreateMerchantSubscriptionPackage1650877189024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_subscription_package_statement_status_enum" AS ENUM('processing', 'processed', 'cancel')`,
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_subscription_package_statement_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'shopditpayCreditCard', 'shopditpayLinepay', 'shopditpayAirpay', 'shopditpayScbEasy', 'shopditpayBbl', 'shopditpayBaybank', 'shopditpayTruemoney')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_subscription_package_statement" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "packageName" character varying NOT NULL, "packageSlug" character varying NOT NULL, "status" "merchant_subscription_package_statement_status_enum" NOT NULL DEFAULT 'processing', "paymentMethodType" "merchant_subscription_package_statement_paymentmethodtype_enum", "numberOfDay" double precision NOT NULL DEFAULT '0', "price" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "UQ_6d44abf737561020f5c30510285" UNIQUE ("number"), CONSTRAINT "PK_4f685d9cdc361a05688aa9e10b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_subscription_package" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "numberOfDay" double precision NOT NULL DEFAULT '0', "price" double precision NOT NULL DEFAULT '0', "commission" double precision NOT NULL DEFAULT '0', "marketplaceCommission" double precision NOT NULL DEFAULT '0', "discountCommission" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_031a8702ee75ce77de0ff601a99" UNIQUE ("slug"), CONSTRAINT "PK_d890e5caadb8b4d37fb3ca9ce15" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "currentSubscriptionPackageSlug" character varying DEFAULT 'trial'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "currentSubscriptionPackagePrice" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "currentSubscriptionPackageTotalNumberOfDay" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "commission" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "marketplaceCommission" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "discountCommission" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package_statement" ADD CONSTRAINT "FK_813b87fa5fc1ba9261383d53d75" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package_statement" DROP CONSTRAINT "FK_813b87fa5fc1ba9261383d53d75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "discountCommission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "marketplaceCommission"`,
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "commission"`);
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "currentSubscriptionPackageTotalNumberOfDay"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "currentSubscriptionPackagePrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "currentSubscriptionPackageSlug"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_subscription_package"`);
    await queryRunner.query(
      `DROP TABLE "merchant_subscription_package_statement"`,
    );
    await queryRunner.query(
      `DROP TYPE "merchant_subscription_package_statement_paymentmethodtype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "merchant_subscription_package_statement_status_enum"`,
    );
  }
}
