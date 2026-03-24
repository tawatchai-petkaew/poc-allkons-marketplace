import {MigrationInterface, QueryRunner} from "typeorm";

export class AddressIdByCisSystem1755908854138 implements MigrationInterface {
    name = 'AddressIdByCisSystem1755908854138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "addressIdCardCisNumber" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "draft_organize"."addressIdCardCisNumber" IS 'Address id by CIS System'`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "addressCurrentCisNumber" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "draft_organize"."addressCurrentCisNumber" IS 'Address id by CIS System'`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "addressTaxInvoiceCisNumber" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "draft_organize"."addressTaxInvoiceCisNumber" IS 'Address id by CIS System'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "draft_organize"."addressTaxInvoiceCisNumber" IS 'Address id by CIS System'`);
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "addressTaxInvoiceCisNumber"`);
        await queryRunner.query(`COMMENT ON COLUMN "draft_organize"."addressCurrentCisNumber" IS 'Address id by CIS System'`);
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "addressCurrentCisNumber"`);
        await queryRunner.query(`COMMENT ON COLUMN "draft_organize"."addressIdCardCisNumber" IS 'Address id by CIS System'`);
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "addressIdCardCisNumber"`);
    }

}
