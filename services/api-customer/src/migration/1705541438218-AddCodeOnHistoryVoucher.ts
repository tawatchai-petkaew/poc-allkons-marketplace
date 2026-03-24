import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCodeOnHistoryVoucher1705541438218 implements MigrationInterface {
    name = 'AddCodeOnHistoryVoucher1705541438218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher_usage_history" ADD "code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher_usage_history" DROP COLUMN "code"`);
    }

}
