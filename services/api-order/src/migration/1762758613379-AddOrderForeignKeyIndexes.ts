import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderForeignKeyIndexes1762758613379
  implements MigrationInterface
{
  name = 'AddOrderForeignKeyIndexes1762758613379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for order-related foreign keys to optimize /api/v2/order endpoint
    // Use IF NOT EXISTS to avoid errors if indexes already exist

    // SubOrderPayment indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sub_order_payment_orderPaymentId" ON "sub_order_payment" ("orderPaymentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sub_order_payment_subOrderId" ON "sub_order_payment" ("subOrderId") `,
    );

    // OrderPayment indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_payment_orderId" ON "order_payment" ("orderId") `,
    );

    // SubOrderDocument indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sub_order_document_fileId" ON "sub_order_document" ("fileId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sub_order_document_subOrderId" ON "sub_order_document" ("subOrderId") `,
    );

    // SubOrder indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sub_order_status" ON "sub_order" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sub_order_orderId" ON "sub_order" ("orderId") `,
    );

    // OrderItem indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_item_productItemId" ON "order_item" ("productItemId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_item_orderId" ON "order_item" ("orderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_item_subOrderId" ON "order_item" ("subOrderId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_order_item_subOrderId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_order_item_orderId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_order_item_productItemId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_sub_order_orderId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_sub_order_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_sub_order_document_subOrderId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_sub_order_document_fileId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_order_payment_orderId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_sub_order_payment_subOrderId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_sub_order_payment_orderPaymentId"`,
    );
  }
}
