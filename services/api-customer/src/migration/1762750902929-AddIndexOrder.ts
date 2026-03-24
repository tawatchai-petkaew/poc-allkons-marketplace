import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexOrder1762750902929 implements MigrationInterface {
    name = 'AddIndexOrder1762750902929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_sub_order_number" ON "sub_order" ("subOrderNumber") `);
        await queryRunner.query(`CREATE INDEX "idx_order" ON "order" ("userId", "merchantId", "organizationId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_order"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sub_order_number"`);
    }

}
