import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderTikTok1671528682143 implements MigrationInterface {
  name = 'CreateOrderTikTok1671528682143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_tik_tok_order_status_enum" AS ENUM('100', '111', '112', '114', '121', '122', '130', '140')`
    );
    await queryRunner.query(
      `CREATE TYPE "order_tik_tok_ext_status_enum" AS ENUM('0', '101', '102', '103')`
    );
    await queryRunner.query(
      `CREATE TABLE "order_tik_tok" ("id" character varying NOT NULL, "order_status" "order_tik_tok_order_status_enum" NOT NULL DEFAULT '100', "payment_method" character varying, "delivery_option" character varying, "shipping_provider" character varying, "shipping_provider_id" integer, "create_time" character varying, "paid_time" character varying, "buyer_message" character varying, "cancel_reason" character varying, "cancel_user" character varying, "ext_status" "order_tik_tok_ext_status_enum" NOT NULL DEFAULT '0', "order_status_old" character varying, "tracking_number" character varying, "rts_time" integer, "rts_sla" integer, "tts_sla" integer, "cancel_order_sla" integer, "update_time" integer, "receiver_address_updated" integer, "buyer_uid" character varying, "split_or_combine_tag" character varying, "fulfillment_type" integer, "seller_note" character varying, "warehouse_id" character varying, "payment_method_type" integer, "payment_method_name" character varying, "delivery_option_type" integer, "delivery_option_description" character varying, "delivery_option_id" character varying, "delivery_sla" character varying, "payment_info" jsonb, "recipient_address" jsonb, "item_list" jsonb, "package_list" jsonb, "order_line_list" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantTikTokId" integer, CONSTRAINT "PK_6d3d1e35bb31dbc526dc25b5550" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "order_item_tik_tok" ("id" SERIAL NOT NULL, "sku_id" character varying, "product_id" character varying, "sku_name" character varying, "quantity" integer, "seller_sku" character varying, "product_name" character varying, "sku_image" character varying, "sku_original_price" integer, "sku_sale_price" integer, "sku_platform_discount" integer, "sku_seller_discount" integer, "sku_ext_status" integer, "sku_display_status" integer, "sku_cancel_reason" character varying, "sku_cancel_user" character varying, "sku_rts_time" integer, "sku_type" integer, "sku_platform_discount_total" integer, "sku_small_order_fee" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "orderTikTokId" character varying, CONSTRAINT "PK_48230d7faee4979a6c1f1f7463b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "order_tik_tok" ADD CONSTRAINT "FK_00edbc7656b55b85cc81f283833" FOREIGN KEY ("merchantTikTokId") REFERENCES "merchant_tik_tok"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" ADD CONSTRAINT "FK_c54728b6191fd9a9e727a1eec75" FOREIGN KEY ("orderTikTokId") REFERENCES "order_tik_tok"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item_tik_tok" DROP CONSTRAINT "FK_c54728b6191fd9a9e727a1eec75"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_tik_tok" DROP CONSTRAINT "FK_00edbc7656b55b85cc81f283833"`
    );
    await queryRunner.query(`DROP TABLE "order_item_tik_tok"`);
    await queryRunner.query(`DROP TABLE "order_tik_tok"`);
    await queryRunner.query(`DROP TYPE "order_tik_tok_ext_status_enum"`);
    await queryRunner.query(`DROP TYPE "order_tik_tok_order_status_enum"`);
  }
}
