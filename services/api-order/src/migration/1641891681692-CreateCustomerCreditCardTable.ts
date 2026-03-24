import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerCreditCardTable1641891681692
  implements MigrationInterface
{
  name = 'CreateCustomerCreditCardTable1641891681692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "customer_credit_card" ("id" SERIAL NOT NULL, "lastNumber" character varying NOT NULL, "token" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, CONSTRAINT "PK_ecde721cb7dbba0fea89f51dce6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_omise_integration" ("id" SERIAL NOT NULL, "publicKey" character varying NOT NULL, "secretKey" character varying NOT NULL, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_de8eb41245d6855873d22ffe03" UNIQUE ("merchantId"), CONSTRAINT "PK_82d42185b892b52cadcf646e067" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "customerCreditCardId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" ADD CONSTRAINT "FK_b6f30880002750c0880c7c9c479" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_b8b98d4ce60dd9658188c3564ea" FOREIGN KEY ("customerCreditCardId") REFERENCES "customer_credit_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_omise_integration" ADD CONSTRAINT "FK_de8eb41245d6855873d22ffe03c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_omise_integration" DROP CONSTRAINT "FK_de8eb41245d6855873d22ffe03c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_b8b98d4ce60dd9658188c3564ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" DROP CONSTRAINT "FK_b6f30880002750c0880c7c9c479"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "customerCreditCardId"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_omise_integration"`);
    await queryRunner.query(`DROP TABLE "customer_credit_card"`);
  }
}
