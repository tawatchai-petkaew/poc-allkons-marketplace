import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateOrderStatus1757580328984 implements MigrationInterface {
    name = 'UpdateOrderStatus1757580328984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."sub_order_status_enum" RENAME TO "sub_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sub_order_status_enum" AS ENUM('NEW', 'WAITING_DELIVERY_FEE', 'PENDING_PAYMENT', 'PENDING_VERIFY', 'PREPARE_PRODUCT', 'DELIVERY', 'SUCCESS', 'CANCEL', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "sub_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sub_order" ALTER COLUMN "status" TYPE "public"."sub_order_status_enum" USING "status"::"text"::"public"."sub_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sub_order" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."sub_order_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('NEW', 'INPROGRESS', 'SUCCESS', 'CANCEL', 'EXPIRE', 'pendingPayment', 'pendingVerify', 'prepareProduct', 'shipping', 'returnProduct')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum_old" AS ENUM('new', 'inProgress', 'success', 'pendingPayment', 'pendingVerify', 'prepareProduct', 'shipping', 'returnProduct', 'cancel', 'expire')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."sub_order_status_enum_old" AS ENUM('NEW', 'PENDING_PAYMENT', 'PENDING_VERIFY', 'PREPARE_PROUDCT', 'SHIPPING', 'RETURN_PRODUCT', 'SUCCESS', 'CANCEL', 'EXPIRE')`);
        await queryRunner.query(`ALTER TABLE "sub_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sub_order" ALTER COLUMN "status" TYPE "public"."sub_order_status_enum_old" USING "status"::"text"::"public"."sub_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sub_order" ALTER COLUMN "status" SET DEFAULT 'NEW'`);
        await queryRunner.query(`DROP TYPE "public"."sub_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sub_order_status_enum_old" RENAME TO "sub_order_status_enum"`);
    }

}
