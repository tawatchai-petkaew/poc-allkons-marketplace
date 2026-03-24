import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCouponCodeColumn1631694561357 implements MigrationInterface {
  name = 'UpdateCouponCodeColumn1631694561357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coupon" RENAME COLUMN "slug" TO "code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" DROP CONSTRAINT "FK_d9b4a233e4228e6d21084c3f63f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" DROP CONSTRAINT "REL_d9b4a233e4228e6d21084c3f63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" ADD CONSTRAINT "FK_d9b4a233e4228e6d21084c3f63f" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" DROP CONSTRAINT "FK_d9b4a233e4228e6d21084c3f63f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" ADD CONSTRAINT "REL_d9b4a233e4228e6d21084c3f63" UNIQUE ("invoiceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" ADD CONSTRAINT "FK_d9b4a233e4228e6d21084c3f63f" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon" RENAME COLUMN "code" TO "slug"`,
    );
  }
}
