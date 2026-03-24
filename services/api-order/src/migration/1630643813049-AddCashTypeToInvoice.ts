import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCashTypeToInvoice1630643813049 implements MigrationInterface {
  name = 'AddCashTypeToInvoice1630643813049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "invoice_paymentmethodtype_enum" RENAME TO "invoice_paymentmethodtype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "invoice_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'omise', 'paypal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "paymentMethodType" TYPE "invoice_paymentmethodtype_enum" USING "paymentMethodType"::"text"::"invoice_paymentmethodtype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "invoice_paymentmethodtype_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "invoice_paymentmethodtype_enum_old" AS ENUM('bankAccount', 'promptpay', 'omise', 'paypal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "paymentMethodType" TYPE "invoice_paymentmethodtype_enum_old" USING "paymentMethodType"::"text"::"invoice_paymentmethodtype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "invoice_paymentmethodtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "invoice_paymentmethodtype_enum_old" RENAME TO "invoice_paymentmethodtype_enum"`,
    );
  }
}
