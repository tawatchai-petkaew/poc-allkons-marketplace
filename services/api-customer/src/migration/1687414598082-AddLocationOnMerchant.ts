import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLocationOnMerchant1687414598082 implements MigrationInterface {
    name = 'AddLocationOnMerchant1687414598082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" ADD "locationName" character varying NOT NULL DEFAULT 'Thailand'`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "locationCode" character varying NOT NULL DEFAULT '66'`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "availableLocale" text array NOT NULL DEFAULT '{en,th,cn}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "availableLocale"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "locationCode"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "locationName"`);
    }

}
