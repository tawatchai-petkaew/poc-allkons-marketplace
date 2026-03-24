import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberStatusToUserOrganization1756457730545
  implements MigrationInterface
{
  name = 'AddMemberStatusToUserOrganization1756457730545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_organization_memberstatus_enum" AS ENUM('NONE', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ADD "memberStatus" "public"."user_organization_memberstatus_enum" NOT NULL DEFAULT 'NONE'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user_organization"."memberStatus" IS 'Status of user invitation to organization'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "user_organization"."memberStatus" IS 'Status of user invitation to organization'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" DROP COLUMN "memberStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_organization_memberstatus_enum"`,
    );
  }
}
