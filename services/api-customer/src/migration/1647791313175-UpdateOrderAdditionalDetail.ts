import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderAdditionalDetail1647791313175
  implements MigrationInterface {
  name = 'UpdateOrderAdditionalDetail1647791313175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "productItemSlug" character varying`
    );
    await queryRunner.query(`ALTER TABLE "order_item" ADD "isBigUnit" boolean`);
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "onFlashSale" boolean`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "onFlashSaleName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paymentMethodName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paymentMethodNumber" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "couponName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "couponCode" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "couponDiscount" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD "customerName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD "customerTel" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD "customerAddressName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD "customerAddressDetail" text`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ADD "merchantShipmentName" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP COLUMN "merchantShipmentName"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP COLUMN "customerAddressDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP COLUMN "customerAddressName"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP COLUMN "customerTel"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" DROP COLUMN "customerName"`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "couponDiscount"`
    );
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "couponCode"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "couponName"`);
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "paymentMethodNumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "paymentMethodName"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "onFlashSaleName"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "onFlashSale"`
    );
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "isBigUnit"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "productItemSlug"`
    );
  }
}
