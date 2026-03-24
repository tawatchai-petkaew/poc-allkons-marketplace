import {MigrationInterface, QueryRunner} from "typeorm";

export class DelColumnNotUsed1756094537961 implements MigrationInterface {
    name = 'DelColumnNotUsed1756094537961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "addressCurrentCisNumber"`);
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "addressIdCardCisNumber"`);
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "addressTaxInvoiceCisNumber"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "addressTaxInvoiceCisNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "addressIdCardCisNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "addressCurrentCisNumber" character varying`);
    }

}
