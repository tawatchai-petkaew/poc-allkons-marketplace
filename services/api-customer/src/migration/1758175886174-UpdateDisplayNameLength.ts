import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateDisplayNameLength1758175886174 implements MigrationInterface {
    name = 'UpdateDisplayNameLength1758175886174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "displayName"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "displayName" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "displayName"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "displayName" character varying(30)`);
    }

}
