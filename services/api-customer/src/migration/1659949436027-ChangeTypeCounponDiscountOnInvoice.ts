import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeCounponDiscountOnInvoice1659949436027
  implements MigrationInterface {
  name = 'ChangeTypeCounponDiscountOnInvoice1659949436027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "couponDiscount"`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "couponDiscount" double precision DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "couponDiscount"`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "couponDiscount" integer`
    );
  }
}
