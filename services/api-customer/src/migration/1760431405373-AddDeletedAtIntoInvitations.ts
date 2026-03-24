import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtIntoInvitations1760431405373
  implements MigrationInterface {
  name = 'AddDeletedAtIntoInvitations1760431405373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "invitations"."deletedAt" IS 'Delete date and time, to support soft delete'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP COLUMN "deletedAt"`,
    );
  }
}
