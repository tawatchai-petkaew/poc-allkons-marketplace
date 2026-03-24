import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToOrganization1759993387525 implements MigrationInterface {
    name = 'AddColumnToOrganization1759993387525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "branchName" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "relationshipType" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "headOfficeId" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "organization"."headOfficeId" IS 'Reference to head office organization ID'`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_2343f806dc1be795db9d2177ad9" FOREIGN KEY ("headOfficeId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_2343f806dc1be795db9d2177ad9"`);
        await queryRunner.query(`COMMENT ON COLUMN "organization"."headOfficeId" IS 'Reference to head office organization ID'`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "headOfficeId"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "relationshipType"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "branchName"`);
    }

}
