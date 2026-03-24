import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDraftProfileTable1748346018509
  implements MigrationInterface
{
  name = 'CreateDraftProfileTable1748346018509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TYPE "public"."draft_profile_registerstatus_enum" AS ENUM ('completed', 'inprogress');
        `);
    await queryRunner.query(`
          CREATE TYPE "public"."draft_profile_organizationtype_enum" AS ENUM ('PERSONAL', 'JURISTIC');
        `);
    await queryRunner.query(`
          CREATE TYPE "public"."draft_profile_step_enum" AS ENUM ('REGISTER', 'USER_INFO', 'ORG_INFO');
        `);
    await queryRunner.query(`
          CREATE TABLE "draft_profile" (
            "id" SERIAL NOT NULL,
            "phoneNumber" character varying(10) NOT NULL,
            "userInfo" json,
            "registerStatus" "public"."draft_profile_registerstatus_enum" NOT NULL DEFAULT 'inprogress',
            "organizationType" "public"."draft_profile_organizationtype_enum" NOT NULL DEFAULT 'PERSONAL',
            "orgInfo" json,
            "cisInfo" json,
            "step" "public"."draft_profile_step_enum" NOT NULL DEFAULT 'USER_INFO',
            "orchestrationStatus" jsonb,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP,
            CONSTRAINT "PK_d12a7bedf5c43dd3e15a7332402" PRIMARY KEY ("id")
          );
        `);
    await queryRunner.query(`
          COMMENT ON COLUMN "draft_profile"."phoneNumber" IS 'phone number';
        `);
    await queryRunner.query(`
          COMMENT ON COLUMN "draft_profile"."userInfo" IS 'user info';
        `);
    await queryRunner.query(`
          COMMENT ON COLUMN "draft_profile"."registerStatus" IS 'register status';
        `);
    await queryRunner.query(`
          COMMENT ON COLUMN "draft_profile"."organizationType" IS 'organization type is PERSONAL or JURISTIC';
        `);
    await queryRunner.query(`
          COMMENT ON COLUMN "draft_profile"."orgInfo" IS 'organization info';
        `);
    await queryRunner.query(`
          COMMENT ON COLUMN "draft_profile"."cisInfo" IS 'cis info';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "draft_profile"`);
    await queryRunner.query(`DROP TYPE "public"."draft_profile_step_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."draft_profile_organizationtype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."draft_profile_registerstatus_enum"`,
    );
  }
}
