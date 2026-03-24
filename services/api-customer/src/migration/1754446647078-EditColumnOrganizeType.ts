import {MigrationInterface, QueryRunner} from "typeorm";

export class EditColumnOrganizeType1754446647078 implements MigrationInterface {
    name = 'EditColumnOrganizeType1754446647078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ALTER COLUMN "organizeType" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ALTER COLUMN "organizeType" SET NOT NULL`);    }

}
