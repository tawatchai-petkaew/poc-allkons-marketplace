import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponTable1631590763772 implements MigrationInterface {
  name = 'CreateCouponTable1631590763772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "coupon_type_enum" AS ENUM('amount', 'freeShipping')`,
    );
    await queryRunner.query(
      `CREATE TYPE "coupon_valuetype_enum" AS ENUM('currency', 'percent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "coupon_status_enum" AS ENUM('active', 'inActive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "type" "coupon_type_enum" NOT NULL, "value" double precision NOT NULL DEFAULT '0', "minimumOrderAmount" integer, "quantity" integer, "usedPerUser" integer, "valueType" "coupon_valuetype_enum", "status" "coupon_status_enum" NOT NULL DEFAULT 'active', "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_fcbe9d72b60eed35f46dc35a682" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "coupon_transaction_type_enum" AS ENUM('used', 'return')`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon_transaction" ("id" SERIAL NOT NULL, "type" "coupon_transaction_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "couponId" integer, "customerId" integer, "invoiceId" integer, CONSTRAINT "REL_d9b4a233e4228e6d21084c3f63" UNIQUE ("invoiceId"), CONSTRAINT "PK_aa60afec99490f16ee941a24b46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "invoice" ADD "couponId" integer`);
    await queryRunner.query(
      `ALTER TABLE "coupon" ADD CONSTRAINT "FK_cdf4fca6e7ea18b6dff42800534" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" ADD CONSTRAINT "FK_e31443a3e0b4da37bb57342b070" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" ADD CONSTRAINT "FK_fd76834d24422781982a02ee6ef" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" ADD CONSTRAINT "FK_d9b4a233e4228e6d21084c3f63f" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_5a93e6159a8150e70c8aa4a9253" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_5a93e6159a8150e70c8aa4a9253"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" DROP CONSTRAINT "FK_d9b4a233e4228e6d21084c3f63f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" DROP CONSTRAINT "FK_fd76834d24422781982a02ee6ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_transaction" DROP CONSTRAINT "FK_e31443a3e0b4da37bb57342b070"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon" DROP CONSTRAINT "FK_cdf4fca6e7ea18b6dff42800534"`,
    );
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "couponId"`);
    await queryRunner.query(`DROP TABLE "coupon_transaction"`);
    await queryRunner.query(`DROP TYPE "coupon_transaction_type_enum"`);
    await queryRunner.query(`DROP TABLE "coupon"`);
    await queryRunner.query(`DROP TYPE "coupon_status_enum"`);
    await queryRunner.query(`DROP TYPE "coupon_valuetype_enum"`);
    await queryRunner.query(`DROP TYPE "coupon_type_enum"`);
  }
}
