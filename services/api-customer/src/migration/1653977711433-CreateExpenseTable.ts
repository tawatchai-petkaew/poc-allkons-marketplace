import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpenseTable1653977711433 implements MigrationInterface {
  name = 'CreateExpenseTable1653977711433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_expense_statement_status_enum" AS ENUM('pendingPayment', 'pendingVerify', 'success', 'cancel', 'expire')`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_expense_statement" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "status" "merchant_expense_statement_status_enum" NOT NULL DEFAULT 'pendingPayment', "orderNumber" character varying NOT NULL, "orderedAt" TIMESTAMP NOT NULL, "orderTotalPrice" double precision NOT NULL DEFAULT '0', "commisionCost" double precision NOT NULL DEFAULT '0', "discountCommisionCost" double precision NOT NULL DEFAULT '0', "totalCost" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_4fec244c0d5f34f715f942a3e11" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_expense_bill_status_enum" AS ENUM('pendingPayment', 'pendingVerify', 'success', 'cancel', 'expire')`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_expense_bill" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "status" "merchant_expense_bill_status_enum" NOT NULL DEFAULT 'pendingPayment', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "dueDate" TIMESTAMP NOT NULL, "paymentDate" TIMESTAMP, "totalRevenue" double precision NOT NULL DEFAULT '0', "totalCommisionCost" double precision NOT NULL DEFAULT '0', "totalDiscountCommisionCost" double precision NOT NULL DEFAULT '0', "totalCost" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_a5e40ac2a938e2f1f564e30342c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_statement" ADD CONSTRAINT "FK_a8912d3cb438e583ca329885e8c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" ADD CONSTRAINT "FK_fcb2c9018b42e9195653949343a" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_bill" DROP CONSTRAINT "FK_fcb2c9018b42e9195653949343a"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_expense_statement" DROP CONSTRAINT "FK_a8912d3cb438e583ca329885e8c"`
    );
    await queryRunner.query(`DROP TABLE "merchant_expense_bill"`);
    await queryRunner.query(`DROP TYPE "merchant_expense_bill_status_enum"`);
    await queryRunner.query(`DROP TABLE "merchant_expense_statement"`);
    await queryRunner.query(
      `DROP TYPE "merchant_expense_statement_status_enum"`
    );
  }
}
