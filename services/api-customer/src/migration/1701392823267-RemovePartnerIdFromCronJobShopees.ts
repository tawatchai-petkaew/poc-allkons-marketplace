import {MigrationInterface, QueryRunner} from "typeorm";

export class RemovePartnerIdFromCronJobShopees1701392823267 implements MigrationInterface {
    name = 'RemovePartnerIdFromCronJobShopees1701392823267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cron_job_shopee" DROP COLUMN "partner_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cron_job_shopee" ADD "partner_id" character varying NOT NULL`);
    }

}
