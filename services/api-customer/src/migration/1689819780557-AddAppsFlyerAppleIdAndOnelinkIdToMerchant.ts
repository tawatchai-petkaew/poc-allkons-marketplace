import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAppsFlyerAppleIdAndOnelinkIdToMerchant1689819780557 implements MigrationInterface {
    name = 'AddAppsFlyerAppleIdAndOnelinkIdToMerchant1689819780557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" ADD "appsFlyerAppleId" character varying`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "appsFlyerOnelinkId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "appsFlyerOnelinkId"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "appsFlyerAppleId"`);
    }

}
