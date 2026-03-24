import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantPdpaTable1655082739081
  implements MigrationInterface {
  name = 'CreateMerchantPdpaTable1655082739081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_pdpa" ("id" SERIAL NOT NULL, "cookiesPolicy" text, "privacyPolicy" text, "termsOfServicePolicy" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_269417ff360f6ffdac0a4cd068" UNIQUE ("merchantId"), CONSTRAINT "PK_00b66883e24284455d7ca3deee5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_policy" DROP COLUMN "privacyPolicy"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_pdpa" ADD CONSTRAINT "FK_269417ff360f6ffdac0a4cd0680" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_pdpa" DROP CONSTRAINT "FK_269417ff360f6ffdac0a4cd0680"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_policy" ADD "privacyPolicy" text`
    );
    await queryRunner.query(`DROP TABLE "merchant_pdpa"`);
  }
}
