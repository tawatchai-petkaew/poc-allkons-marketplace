import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnInDraftUser1760511990940 implements MigrationInterface {
    name = 'AddColumnInDraftUser1760511990940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_user" ADD "fileInfo" json`);
        await queryRunner.query(`COMMENT ON COLUMN "draft_user"."fileInfo" IS 'file info'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "draft_user"."fileInfo" IS 'file info'`);
        await queryRunner.query(`ALTER TABLE "draft_user" DROP COLUMN "fileInfo"`);
    }

}
