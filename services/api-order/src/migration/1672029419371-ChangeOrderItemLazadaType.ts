import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeOrderItemLazadaType1672029419371
  implements MigrationInterface
{
  name = 'ChangeOrderItemLazadaType1672029419371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" DROP COLUMN "voucher_platform"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" ADD "voucher_platform" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" DROP COLUMN "shipping_fee_discount_platform"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" ADD "shipping_fee_discount_platform" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" DROP COLUMN "shipping_fee_discount_platform"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" ADD "shipping_fee_discount_platform" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" DROP COLUMN "voucher_platform"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" ADD "voucher_platform" integer`,
    );
  }
}
