import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopditPayment1644900730331 implements MigrationInterface {
  name = 'AddShopditPayment1644900730331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_shopdit_payment_method" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "creditCardIsActive" boolean NOT NULL DEFAULT false, "linepayIsActive" boolean NOT NULL DEFAULT false, "airpayIsActive" boolean NOT NULL DEFAULT false, "scbEasyIsActive" boolean NOT NULL DEFAULT false, "bblIsActive" boolean NOT NULL DEFAULT false, "baybankIsActive" boolean NOT NULL DEFAULT false, "truemoneyIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_26133753b1b7c8741960423995" UNIQUE ("merchantId"), CONSTRAINT "PK_908707d0866fcdc10f246ae3a22" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "merchantShopditPaymentMethodId" integer`
    );
    await queryRunner.query(
      `ALTER TYPE "invoice_paymentmethodtype_enum" RENAME TO "invoice_paymentmethodtype_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "invoice_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'omise', 'paypal', 'shopditpayCreditCard', 'shopditpayLinepay', 'airpayCreditCard', 'scbEasyCreditCard', 'bblCreditCard', 'baybankCreditCard', 'truemoneyCreditCard')`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "paymentMethodType" TYPE "invoice_paymentmethodtype_enum" USING "paymentMethodType"::"text"::"invoice_paymentmethodtype_enum"`
    );
    await queryRunner.query(`DROP TYPE "invoice_paymentmethodtype_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "merchant_shopdit_payment_method" ADD CONSTRAINT "FK_26133753b1b7c87419604239959" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_9a6f5abce26ca4fb0fe63df563b" FOREIGN KEY ("merchantShopditPaymentMethodId") REFERENCES "merchant_shopdit_payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_9a6f5abce26ca4fb0fe63df563b"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopdit_payment_method" DROP CONSTRAINT "FK_26133753b1b7c87419604239959"`
    );
    await queryRunner.query(
      `CREATE TYPE "invoice_paymentmethodtype_enum_old" AS ENUM('bankAccount', 'promptpay', 'cash', 'omise', 'paypal')`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "paymentMethodType" TYPE "invoice_paymentmethodtype_enum_old" USING "paymentMethodType"::"text"::"invoice_paymentmethodtype_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "invoice_paymentmethodtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "invoice_paymentmethodtype_enum_old" RENAME TO "invoice_paymentmethodtype_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "merchantShopditPaymentMethodId"`
    );
    await queryRunner.query(`DROP TABLE "merchant_shopdit_payment_method"`);
  }
}
