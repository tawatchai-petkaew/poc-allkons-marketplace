import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantBankAccountTableAndMerchantPromptpayTable1628652797221
  implements MigrationInterface
{
  name = 'AddMerchantBankAccountTableAndMerchantPromptpayTable1628652797221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_promptpay_payment_method" ("id" SERIAL NOT NULL, "number" character varying NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "imageUploadId" integer, "merchantId" integer, CONSTRAINT "PK_cc972e023b5681fed59d26b974d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_bank_account_payment_method" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "number" character varying NOT NULL, "type" character varying, "branch" character varying, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bankId" integer, "merchantId" integer, CONSTRAINT "PK_c5cf113fb105109e8df69bc48e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bank" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_7651eaf705126155142947926e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_promptpay_payment_method" ADD CONSTRAINT "FK_8257e7870928f7a21cba0175a01" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_promptpay_payment_method" ADD CONSTRAINT "FK_8e2379af2ef6a6a8651f6993cab" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_bank_account_payment_method" ADD CONSTRAINT "FK_c45ad43c0869068bdf7275c70e9" FOREIGN KEY ("bankId") REFERENCES "bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_bank_account_payment_method" ADD CONSTRAINT "FK_99eb2a4f4fccf1e2c1f4aa45b53" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_bank_account_payment_method" DROP CONSTRAINT "FK_99eb2a4f4fccf1e2c1f4aa45b53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_bank_account_payment_method" DROP CONSTRAINT "FK_c45ad43c0869068bdf7275c70e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_promptpay_payment_method" DROP CONSTRAINT "FK_8e2379af2ef6a6a8651f6993cab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_promptpay_payment_method" DROP CONSTRAINT "FK_8257e7870928f7a21cba0175a01"`,
    );
    await queryRunner.query(`DROP TABLE "bank"`);
    await queryRunner.query(
      `DROP TABLE "merchant_bank_account_payment_method"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_promptpay_payment_method"`);
  }
}
