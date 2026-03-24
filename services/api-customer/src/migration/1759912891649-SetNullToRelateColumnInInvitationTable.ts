import {MigrationInterface, QueryRunner} from "typeorm";

export class SetNullToRelateColumnInInvitationTable1759912891649 implements MigrationInterface {
    name = 'SetNullToRelateColumnInInvitationTable1759912891649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_b7423cfb362a842b7ea0a3763b9"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_7f2c37e6463b81cf0f2c72d2819"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_2b12d63af1d6ba70d930222248e"`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "invitedByUserId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "roleId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_b7423cfb362a842b7ea0a3763b9" FOREIGN KEY ("invitedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_7f2c37e6463b81cf0f2c72d2819" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_2b12d63af1d6ba70d930222248e" FOREIGN KEY ("approverOrgId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_2b12d63af1d6ba70d930222248e"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_7f2c37e6463b81cf0f2c72d2819"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_b7423cfb362a842b7ea0a3763b9"`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "roleId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "invitedByUserId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_2b12d63af1d6ba70d930222248e" FOREIGN KEY ("approverOrgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_7f2c37e6463b81cf0f2c72d2819" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_b7423cfb362a842b7ea0a3763b9" FOREIGN KEY ("invitedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
