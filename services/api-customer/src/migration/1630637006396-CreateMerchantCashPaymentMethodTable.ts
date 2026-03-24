import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantCashPaymentMethodTable1630637006396
  implements MigrationInterface {
  name = 'CreateMerchantCashPaymentMethodTable1630637006396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_cash_payment_method" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_b14b71c43941c07e8cac2b7218" UNIQUE ("merchantId"), CONSTRAINT "PK_0f59e33238988f9461322468c84" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "merchantCashPaymentMethodId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_cash_payment_method" ADD CONSTRAINT "FK_b14b71c43941c07e8cac2b7218a" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_24b74faa5e8f51dbac068596df9" FOREIGN KEY ("merchantCashPaymentMethodId") REFERENCES "merchant_cash_payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_24b74faa5e8f51dbac068596df9"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_cash_payment_method" DROP CONSTRAINT "FK_b14b71c43941c07e8cac2b7218a"`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "merchantCashPaymentMethodId"`
    );
    await queryRunner.query(`DROP TABLE "merchant_cash_payment_method"`);
  }
}
