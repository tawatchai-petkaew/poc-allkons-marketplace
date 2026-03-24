import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteEnumInvoicePaymentType1645412619156
  implements MigrationInterface
{
  name = 'DeleteEnumInvoicePaymentType1645412619156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "paymentMethodType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."invoice_paymentmethodtype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invoice_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'omise', 'paypal', 'shopditpayCreditCard', 'shopditpayLinepay', 'airpayCreditCard', 'scbEasyCreditCard', 'bblCreditCard', 'baybankCreditCard', 'truemoneyCreditCard')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paymentMethodType" "invoice_paymentmethodtype_enum"`,
    );
  }
}
