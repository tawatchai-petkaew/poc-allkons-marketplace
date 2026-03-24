import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherTable1700533403337 implements MigrationInterface {
  name = 'AddVoucherTable1700533403337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."voucher_type_enum" AS ENUM('e-voucher', 'e-booking')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."voucher_status_enum" AS ENUM('pending', 'completed', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "voucher" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "bookingStartDate" TIMESTAMP, "bookingEndDate" TIMESTAMP, "voucherExpiredDate" TIMESTAMP, "type" "public"."voucher_type_enum" NOT NULL DEFAULT 'e-voucher', "status" "public"."voucher_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "orderItemId" integer, CONSTRAINT "REL_8011a27b9309aa602790eaf2ed" UNIQUE ("orderItemId"), CONSTRAINT "PK_677ae75f380e81c2f103a57ffaf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_item_orderitemtype_enum" AS ENUM('product', 'voucher')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "orderItemType" "public"."order_item_orderitemtype_enum" NOT NULL DEFAULT 'product'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_ordertype_enum" AS ENUM('onlyProduct', 'onlyService', 'productAndService')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "orderType" "public"."order_ordertype_enum" NOT NULL DEFAULT 'onlyProduct'`,
    );
    await queryRunner.query(
      `ALTER TABLE "voucher" ADD CONSTRAINT "FK_8011a27b9309aa602790eaf2ed1" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "voucher" DROP CONSTRAINT "FK_8011a27b9309aa602790eaf2ed1"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "orderType"`);
    await queryRunner.query(`DROP TYPE "public"."order_ordertype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "orderItemType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_item_orderitemtype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "voucher"`);
    await queryRunner.query(`DROP TYPE "public"."voucher_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."voucher_type_enum"`);
  }
}
