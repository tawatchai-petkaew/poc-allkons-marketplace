import {MigrationInterface, QueryRunner} from "typeorm";

export class DelColumnNotUsed1755499887732 implements MigrationInterface {
    name = 'DelColumnNotUsed1755499887732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_identity_documents" DROP COLUMN "draft_organize_id"`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ALTER COLUMN "draftOrganizeId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_a6f953d3ffe061cf2dbe0c8768" ON "user_identity_documents" ("draftOrganizeId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ALTER COLUMN "draftOrganizeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ADD "draft_organize_id" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_04e50b77bbb82007454de89707" ON "user_identity_documents" ("draft_organize_id") `);
    }

}
