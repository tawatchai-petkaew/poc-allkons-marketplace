import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherHistory1704692128337 implements MigrationInterface {
  name = 'AddVoucherHistory1704692128337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "voucher_usage_history" ("id" SERIAL NOT NULL, "usageDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "voucherId" integer, CONSTRAINT "PK_97b8f9bdc0490fd34389ae63f30" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_shipment_shipmenttype_enum" RENAME TO "merchant_shipment_shipmenttype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_shipment_shipmenttype_enum" AS ENUM('pickup', 'transport', 'online')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ALTER COLUMN "shipmentType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ALTER COLUMN "shipmentType" TYPE "public"."merchant_shipment_shipmenttype_enum" USING "shipmentType"::"text"::"public"."merchant_shipment_shipmenttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ALTER COLUMN "shipmentType" SET DEFAULT 'pickup'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_shipment_shipmenttype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "voucher_usage_history" ADD CONSTRAINT "FK_c2e0a700c75c5b6f47f260df830" FOREIGN KEY ("voucherId") REFERENCES "voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "voucher_usage_history" DROP CONSTRAINT "FK_c2e0a700c75c5b6f47f260df830"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_shipment_shipmenttype_enum_old" AS ENUM('pickup', 'transport')`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ALTER COLUMN "shipmentType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ALTER COLUMN "shipmentType" TYPE "public"."merchant_shipment_shipmenttype_enum_old" USING "shipmentType"::"text"::"public"."merchant_shipment_shipmenttype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ALTER COLUMN "shipmentType" SET DEFAULT 'pickup'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_shipment_shipmenttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."merchant_shipment_shipmenttype_enum_old" RENAME TO "merchant_shipment_shipmenttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "voucher_usage_history"`);
  }
}
