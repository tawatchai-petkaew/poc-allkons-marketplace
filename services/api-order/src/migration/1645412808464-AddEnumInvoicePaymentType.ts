import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnumInvoicePaymentType1645412808464
  implements MigrationInterface
{
  name = 'AddEnumInvoicePaymentType1645412808464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "invoice_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'omise', 'paypal', 'shopditpayCreditCard', 'shopditpayLinepay', 'shopditpayAirpay', 'shopditpayScbEasy', 'shopditpayBbl', 'shopditpayBaybank', 'shopditpayTruemoney')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paymentMethodType" "invoice_paymentmethodtype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "paymentMethodType"`,
    );
    await queryRunner.query(`DROP TYPE "invoice_paymentmethodtype_enum"`);
  }
}
