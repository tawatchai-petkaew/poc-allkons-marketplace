import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsEnableOtpLoginToMerchant1709259448670 implements MigrationInterface {
    name = 'AddIsEnableOtpLoginToMerchant1709259448670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" ADD "isEnableOtpLogin" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "isEnableOtpLogin"`);
    }

}
