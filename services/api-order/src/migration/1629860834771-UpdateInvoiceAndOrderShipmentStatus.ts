import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceAndOrderShipmentStatus1629860834771
  implements MigrationInterface
{
  name = 'UpdateInvoiceAndOrderShipmentStatus1629860834771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "order_shipment_status_enum" RENAME TO "order_shipment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_shipment_status_enum" AS ENUM('processing', 'processed', 'cancel', 'expire', 'shipping')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ALTER COLUMN "status" TYPE "order_shipment_status_enum" USING "status"::"text"::"order_shipment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ALTER COLUMN "status" SET DEFAULT 'processing'`,
    );
    await queryRunner.query(`DROP TYPE "order_shipment_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "invoice_status_enum" RENAME TO "invoice_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "invoice_status_enum" AS ENUM('processing', 'processed', 'cancel', 'expire')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "status" TYPE "invoice_status_enum" USING "status"::"text"::"invoice_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "status" SET DEFAULT 'processing'`,
    );
    await queryRunner.query(`DROP TYPE "invoice_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "invoice_status_enum_old" AS ENUM('processing', 'processed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "status" TYPE "invoice_status_enum_old" USING "status"::"text"::"invoice_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "status" SET DEFAULT 'processing'`,
    );
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "invoice_status_enum_old" RENAME TO "invoice_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_shipment_status_enum_old" AS ENUM('processing', 'processed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ALTER COLUMN "status" TYPE "order_shipment_status_enum_old" USING "status"::"text"::"order_shipment_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shipment" ALTER COLUMN "status" SET DEFAULT 'processing'`,
    );
    await queryRunner.query(`DROP TYPE "order_shipment_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "order_shipment_status_enum_old" RENAME TO "order_shipment_status_enum"`,
    );
  }
}
