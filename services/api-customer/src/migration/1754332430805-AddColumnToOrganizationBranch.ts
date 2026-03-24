import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToOrganizationBranch1754332430805 implements MigrationInterface {
    name = 'AddColumnToOrganizationBranch1754332430805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_branch" ADD "organizeBranchNumber" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_branch" DROP COLUMN "organizeBranchNumber"`);
    }

}
