import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantPolicy1633504186110 implements MigrationInterface {
  name = 'CreateMerchantPolicy1633504186110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_policy" ("id" SERIAL NOT NULL, "returnAndRefundPolicy" text, "privacyPolicy" text, "shippingPolicy" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_22678d7d0753d76f08fbdcadcf" UNIQUE ("merchantId"), CONSTRAINT "PK_9dad28c850286478d7e2807ebe6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_policy" ADD CONSTRAINT "FK_22678d7d0753d76f08fbdcadcf1" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_policy" DROP CONSTRAINT "FK_22678d7d0753d76f08fbdcadcf1"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_policy"`);
  }
}
