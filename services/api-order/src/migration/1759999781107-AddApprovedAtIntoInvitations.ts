import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovedAtIntoInvitations1759999781107
  implements MigrationInterface
{
  name = 'AddApprovedAtIntoInvitations1759999781107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD "approvedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "invitations"."approvedAt" IS 'Store the date and time when the invitation approval occurred'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP COLUMN "approvedAt"`,
    );
  }
}
