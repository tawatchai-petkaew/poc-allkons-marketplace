import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnApproverOrgId1759482797780 implements MigrationInterface {
    name = 'AddColumnApproverOrgId1759482797780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" ADD "approverOrgId" integer`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_2b12d63af1d6ba70d930222248e" FOREIGN KEY ("approverOrgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_2b12d63af1d6ba70d930222248e"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "approverOrgId"`);
    }

}
