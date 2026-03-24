import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnCisNumberToStore1760033624616 implements MigrationInterface {
    name = 'AddColumnCisNumberToStore1760033624616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" ADD "cisNumber" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."cisNumber" IS 'CIS_NUMBER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "store"."cisNumber" IS 'CIS_NUMBER'`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "cisNumber"`);
    }

}
