import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateOrderPaymentColumns1757653521111 implements MigrationInterface {
    name = 'UpdateOrderPaymentColumns1757653521111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_payment" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_paymentmethod_enum" AS ENUM('PG_CREDIT_CARD', 'PG_PROMPTPAY', 'PG_BILL', 'BANK_TRANSFER', 'CREDIT_MERCHANT')`);
        await queryRunner.query(`ALTER TABLE "order_payment" ADD "paymentMethod" "public"."order_payment_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "order_payment" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_status_enum" AS ENUM('PENDING', 'SUCCESS', 'CANCELED', 'NEW')`);
        await queryRunner.query(`ALTER TABLE "order_payment" ADD "status" "public"."order_payment_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_payment" ALTER COLUMN "payTime" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_payment" ALTER COLUMN "payTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_payment" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_payment" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_payment" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "order_payment" ADD "paymentMethod" character varying NOT NULL`);
    }

}
