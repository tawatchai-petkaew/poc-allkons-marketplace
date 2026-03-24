import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNameEnToMerchantCategory1687764239040 implements MigrationInterface {
    name = 'AddNameEnToMerchantCategory1687764239040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant_category" ADD "nameEn" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant_category" DROP COLUMN "nameEn"`);
    }

}
