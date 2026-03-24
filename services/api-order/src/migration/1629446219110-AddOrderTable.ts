import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderTable1629446219110 implements MigrationInterface {
  name = 'AddOrderTable1629446219110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_shipment_status_enum" AS ENUM('processing', 'processed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_shipment" ("id" SERIAL NOT NULL, "status" "order_shipment_status_enum" NOT NULL DEFAULT 'processing', "shipedAt" TIMESTAMP, "number" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "orderId" integer, "merchantShipmentId" integer, CONSTRAINT "REL_f80d1de79a7840da481ba6d9f6" UNIQUE ("orderId"), CONSTRAINT "PK_edaad8e046652a74236a6d3f41f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM('pendingPayment', 'prepareProduct', 'shipping', 'returnProduct', 'success', 'cancel', 'expire')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "status" "order_status_enum" NOT NULL DEFAULT 'pendingPayment', "orderedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "customerId" integer, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "unit" character varying NOT NULL, "size" character varying, "color" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "orderId" integer, "productId" integer, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "invoice_status_enum" AS ENUM('processing', 'processed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "invoice_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'omise', 'paypal')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice" ("id" SERIAL NOT NULL, "totalPrice" double precision NOT NULL DEFAULT '0', "productPrice" double precision NOT NULL DEFAULT '0', "productDiscountPrice" double precision NOT NULL DEFAULT '0', "shipmentPrice" double precision NOT NULL DEFAULT '0', "status" "invoice_status_enum" NOT NULL DEFAULT 'processing', "paymentMethodType" "invoice_paymentmethodtype_enum" NOT NULL, "paymentAt" TIMESTAMP, "timePaymentAt" character varying, "isVerify" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "orderId" integer, "merchantBankAccountPaymentMethodId" integer, "merchantPromptpayPaymentMethodId" integer, "imageUploadId" integer, CONSTRAINT "REL_f494ce6746b91e9ec9562af485" UNIQUE ("orderId"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD CONSTRAINT "FK_f80d1de79a7840da481ba6d9f6c" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD CONSTRAINT "FK_c8dc71384125329fb7efde8ba4d" FOREIGN KEY ("merchantShipmentId") REFERENCES "merchant_shipment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_293ad75db4c3b2aa62996c75ad1" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_124456e637cca7a415897dce659" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_4252ac25490255d661848bd34c2" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_f494ce6746b91e9ec9562af4857" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_52fb08f020cc1111b22d58bd759" FOREIGN KEY ("merchantBankAccountPaymentMethodId") REFERENCES "merchant_bank_account_payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_b5ca6b43bdd928f3902e8bcbe6b" FOREIGN KEY ("merchantPromptpayPaymentMethodId") REFERENCES "merchant_promptpay_payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_1ae3467b26c500ef8f831ac69c5" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_1ae3467b26c500ef8f831ac69c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_b5ca6b43bdd928f3902e8bcbe6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_52fb08f020cc1111b22d58bd759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_f494ce6746b91e9ec9562af4857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_4252ac25490255d661848bd34c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_124456e637cca7a415897dce659"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_293ad75db4c3b2aa62996c75ad1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP CONSTRAINT "FK_c8dc71384125329fb7efde8ba4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP CONSTRAINT "FK_f80d1de79a7840da481ba6d9f6c"`,
    );
    await queryRunner.query(`DROP TABLE "invoice"`);
    await queryRunner.query(`DROP TYPE "invoice_paymentmethodtype_enum"`);
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_shipment"`);
    await queryRunner.query(`DROP TYPE "order_shipment_status_enum"`);
  }
}
