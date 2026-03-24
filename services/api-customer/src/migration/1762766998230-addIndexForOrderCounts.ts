import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndexForOrderCounts1762766998230 implements MigrationInterface {
    name = 'addIndexForOrderCounts1762766998230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_sub_order_orderid_status" ON "sub_order" ("orderId", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_order_merchant_org" ON "order" ("merchantId", "organizationId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_order_merchant_org"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sub_order_orderid_status"`);
    }

}
