import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToUserTable1753808879258 implements MigrationInterface {
    name = 'AddColumnToUserTable1753808879258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "createdInAuth" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdInAuth"`);
    }

}
