import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpenseBillToTaxInvoiceTable1677080222309
  implements MigrationInterface
{
  name = 'AddExpenseBillToTaxInvoiceTable1677080222309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" ADD "merchantExpenseBillId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" ADD CONSTRAINT "UQ_c890692a9a9a3bf949979fc41a6" UNIQUE ("merchantExpenseBillId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" ADD CONSTRAINT "FK_c890692a9a9a3bf949979fc41a6" FOREIGN KEY ("merchantExpenseBillId") REFERENCES "merchant_expense_bill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" DROP CONSTRAINT "FK_c890692a9a9a3bf949979fc41a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" DROP CONSTRAINT "UQ_c890692a9a9a3bf949979fc41a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" DROP COLUMN "merchantExpenseBillId"`,
    );
  }
}
