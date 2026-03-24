import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsError1756723056283 implements MigrationInterface {
    name = 'AddIsError1756723056283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "isError" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "isError"`);
    }

}
