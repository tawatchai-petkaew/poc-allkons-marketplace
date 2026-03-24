import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderLazada1671513344278 implements MigrationInterface {
  name = 'CreateOrderLazada1671513344278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_item_lazada" ("id" SERIAL NOT NULL, "pick_up_store_info" jsonb DEFAULT '{}', "tax_amount" double precision, "reason" character varying, "sla_time_stamp" character varying, "voucher_seller" double precision, "purchase_order_id" character varying, "voucher_code_seller" character varying, "voucher_code" character varying, "package_id" character varying, "buyer_id" character varying, "variation" character varying, "product_id" character varying, "voucher_code_platform" character varying, "purchase_order_number" character varying, "sku" character varying, "order_type" character varying, "invoice_number" character varying, "cancel_return_initiator" character varying, "shop_sku" character varying, "is_reroute" integer, "stage_pay_status" character varying, "sku_id" character varying, "tracking_code_pre" character varying, "order_item_id" character varying, "shop_id" character varying, "order_flag" character varying, "is_fbl" integer, "name" character varying, "delivery_option_sof" integer, "order_id" character varying, "fulfillment_sla" character varying, "status" character varying, "product_main_image" character varying, "voucher_platform" integer, "paid_price" double precision, "product_detail_url" character varying, "warehouse_code" character varying, "promised_shipping_time" character varying, "shipping_type" character varying, "voucher_seller_lpi" integer, "shipping_fee_discount_platform" integer, "wallet_credits" integer, "currency" character varying, "shipping_provider_type" character varying, "voucher_platform_lpi" double precision, "shipping_fee_original" double precision, "item_price" double precision, "is_digital" integer, "shipping_service_cost" double precision, "tracking_code" character varying, "shipping_fee_discount_seller" double precision, "shipping_amount" double precision, "reason_detail" character varying, "return_status" character varying, "shipment_provider" character varying, "priority_fulfillment_tag" character varying, "voucher_amount" double precision, "digital_delivery_info" character varying, "extra_attributes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "orderLazadaId" integer, CONSTRAINT "PK_f7c99538bee2792debe3c68b168" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_lazada" ("id" SERIAL NOT NULL, "voucher" double precision, "warehouse_code" character varying, "order_number" character varying, "voucher_code" character varying, "gift_option" boolean, "shipping_fee_discount_platform" double precision, "customer_last_name" character varying, "promised_shipping_times" character varying, "price" character varying, "national_registration_number" character varying, "shipping_fee_original" double precision, "payment_method" character varying, "customer_first_name" character varying, "shipping_fee_discount_seller" double precision, "shipping_fee" double precision, "branch_number" character varying, "tax_code" character varying, "items_count" double precision, "delivery_info" character varying, "statuses" text array, "address_billing" jsonb DEFAULT '{}', "extra_attributes" character varying, "order_id" character varying, "gift_message" character varying, "remarks" character varying, "address_shipping" jsonb DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_976199424c0c16eca4c535ffaf2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" ADD CONSTRAINT "FK_243f70340f947edf111673faa83" FOREIGN KEY ("orderLazadaId") REFERENCES "order_lazada"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_lazada" ADD CONSTRAINT "FK_73f2bc4e0da10aa6a8c21e7e375" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_lazada" DROP CONSTRAINT "FK_73f2bc4e0da10aa6a8c21e7e375"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_lazada" DROP CONSTRAINT "FK_243f70340f947edf111673faa83"`,
    );
    await queryRunner.query(`DROP TABLE "order_lazada"`);
    await queryRunner.query(`DROP TABLE "order_item_lazada"`);
  }
}
