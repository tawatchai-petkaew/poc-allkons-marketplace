import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerCouponTable1635307177315
  implements MigrationInterface
{
  name = 'CreateCustomerCouponTable1635307177315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_coupon_status_enum" AS ENUM('pending', 'active', 'expire', 'used')`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_coupon" ("id" SERIAL NOT NULL, "status" "customer_coupon_status_enum" NOT NULL, "usedQuantity" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, "couponId" integer, CONSTRAINT "PK_05c8f788913683bf394f5e4f5be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_coupon" ADD CONSTRAINT "FK_9f6d01c6353596c9e5b01b878ea" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_coupon" ADD CONSTRAINT "FK_cb7595fc47719c080c068bbd58b" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_coupon" DROP CONSTRAINT "FK_cb7595fc47719c080c068bbd58b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_coupon" DROP CONSTRAINT "FK_9f6d01c6353596c9e5b01b878ea"`,
    );
    await queryRunner.query(`DROP TABLE "customer_coupon"`);
    await queryRunner.query(`DROP TYPE "customer_coupon_status_enum"`);
  }
}
