import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuantityProductItem1701827521675 implements MigrationInterface {
    name = 'AddQuantityProductItem1701827521675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" ADD "voucherQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "voucherExpiredDays" integer`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "voucherUsedPerUser" integer`);
        await queryRunner.query(`ALTER TABLE "product_item" ADD "voucherQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "product_item" ADD "voucherExpiredDays" integer`);
        await queryRunner.query(`ALTER TABLE "product_item" ADD "voucherUsedPerUser" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_item" DROP COLUMN "voucherUsedPerUser"`);
        await queryRunner.query(`ALTER TABLE "product_item" DROP COLUMN "voucherExpiredDays"`);
        await queryRunner.query(`ALTER TABLE "product_item" DROP COLUMN "voucherQuantity"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "voucherUsedPerUser"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "voucherExpiredDays"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "voucherQuantity"`);
    }

}
