import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaxInvoiceTable1676312990354 implements MigrationInterface {
  name = 'CreateTaxInvoiceTable1676312990354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_tax_invoice_item" ("id" SERIAL NOT NULL, "title" character varying, "description" character varying, "amount" double precision NOT NULL DEFAULT '0', "unit" character varying, "totalAmount" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantTaxInvoiceId" integer, CONSTRAINT "PK_ad142c66070eb2ec5d51d6a140c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_tax_invoice_type_enum" AS ENUM('subscriptionPackage', 'merchantExpenseBill')`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_tax_invoice" ("id" SERIAL NOT NULL, "type" "merchant_tax_invoice_type_enum" NOT NULL, "number" character varying NOT NULL, "companyName" character varying, "companyId" character varying, "companyBranch" character varying, "companyAddress" character varying, "postCodeCompanyAddress" character varying, "provinceCompanyAddress" character varying, "districtCompanyAddress" character varying, "subdistrictCompanyAddress" character varying, "amount" double precision NOT NULL DEFAULT '0', "amountWithoutVat" double precision NOT NULL DEFAULT '0', "discount" double precision NOT NULL DEFAULT '0', "preAmountWithVat" double precision NOT NULL DEFAULT '0', "vat" double precision NOT NULL DEFAULT '0', "totalAmount" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantSubscriptionPackageStatementId" integer, CONSTRAINT "UQ_6495a597d450dec1bb8e366fa21" UNIQUE ("number"), CONSTRAINT "REL_a95cda453ec853e0b2ddf4da83" UNIQUE ("merchantSubscriptionPackageStatementId"), CONSTRAINT "PK_2408e2ed5cb65bfd6c47151cb0b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice_item" ADD CONSTRAINT "FK_d32e000e58df7727abd1282e18e" FOREIGN KEY ("merchantTaxInvoiceId") REFERENCES "merchant_tax_invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" ADD CONSTRAINT "FK_a95cda453ec853e0b2ddf4da833" FOREIGN KEY ("merchantSubscriptionPackageStatementId") REFERENCES "merchant_subscription_package_statement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice" DROP CONSTRAINT "FK_a95cda453ec853e0b2ddf4da833"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tax_invoice_item" DROP CONSTRAINT "FK_d32e000e58df7727abd1282e18e"`
    );
    await queryRunner.query(`DROP TABLE "merchant_tax_invoice"`);
    await queryRunner.query(`DROP TYPE "merchant_tax_invoice_type_enum"`);
    await queryRunner.query(`DROP TABLE "merchant_tax_invoice_item"`);
  }
}
