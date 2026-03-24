import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexInDraftUserAndDraftUserAddress1760210269289 implements MigrationInterface {
    name = 'AddIndexInDraftUserAndDraftUserAddress1760210269289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3789a6a5307b5b6fbcc1afb715" ON "draft_user" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_15e83fedf081f6bc403b36de43" ON "draft_user_address" ("addressType", "draftUserId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_15e83fedf081f6bc403b36de43"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3789a6a5307b5b6fbcc1afb715"`);
    }

}
