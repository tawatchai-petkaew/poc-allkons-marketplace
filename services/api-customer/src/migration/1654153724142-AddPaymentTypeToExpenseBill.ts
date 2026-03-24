import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentTypeToExpenseBill1654153724142
  implements MigrationInterface {
  name = 'AddPaymentTypeToExpenseBill1654153724142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_expense_bill_paymentmethodtype_enum" AS ENUM('bankAccount', 'promptpay', 'cash', 'shopditpayCreditCard', 'shopditpayLinepay', 'shopditpayAirpay', 'shopditpayScbEasy', 'shopditpayBbl', 'shopditpayBaybank', 'shopditpayTruemoney')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ADD "paymentMethodType" "merchant_expense_bill_paymentmethodtype_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "merchant_expense_bill_status_enum" RENAME TO "merchant_expense_bill_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_expense_bill_status_enum" AS ENUM('pendingPayment', 'pendingVerify', 'success', 'cancel', 'expire', 'overDue')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ALTER COLUMN "status" TYPE "merchant_expense_bill_status_enum" USING "status"::"text"::"merchant_expense_bill_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`
    );
    await queryRunner.query(
      `DROP TYPE "merchant_expense_bill_status_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_expense_bill_status_enum_old" AS ENUM('cancel', 'expire', 'pendingPayment', 'pendingVerify', 'success')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ALTER COLUMN "status" TYPE "merchant_expense_bill_status_enum_old" USING "status"::"text"::"merchant_expense_bill_status_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`
    );
    await queryRunner.query(`DROP TYPE "merchant_expense_bill_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "merchant_expense_bill_status_enum_old" RENAME TO "merchant_expense_bill_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" DROP COLUMN "paymentMethodType"`
    );
    await queryRunner.query(
      `DROP TYPE "merchant_expense_bill_paymentmethodtype_enum"`
    );
  }
}
