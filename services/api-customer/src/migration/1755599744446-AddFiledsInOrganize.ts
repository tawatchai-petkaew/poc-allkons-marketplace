import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFiledsInOrganize1755599744446 implements MigrationInterface {
    name = 'AddFiledsInOrganize1755599744446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "isUseFullName" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "organization"."isUseFullName" IS 'Firstname + Lastname'`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "commercialName" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "organization"."commercialName" IS 'Commercial Name'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "organization"."commercialName" IS 'Commercial Name'`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "commercialName"`);
        await queryRunner.query(`COMMENT ON COLUMN "organization"."isUseFullName" IS 'Firstname + Lastname'`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "isUseFullName"`);
    }

}
