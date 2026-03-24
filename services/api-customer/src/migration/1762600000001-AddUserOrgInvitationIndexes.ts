import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserOrgInvitationIndexes1762600000001 implements MigrationInterface {
  name = 'AddUserOrgInvitationIndexes1762600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_organization_organize_created"
       ON "user_organization" ("organizeId", "createdAt" DESC)`
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_organization_organize_role"
       ON "user_organization" ("organizeId", "roleId")`
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_invitation_organize_status_created"
       ON "invitations" ("organizeId", "status", "createdAt" DESC)`
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_invitation_phone_country"
       ON "invitations" ("phoneNumber", "countryCode")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invitation_phone_country"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invitation_organize_status_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_organization_organize_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_organization_organize_created"`);
  }
}