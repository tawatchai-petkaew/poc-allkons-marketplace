import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDraftOrganizeTable1755232017722
  implements MigrationInterface
{
  name = 'CreateDraftOrganizeTable1755232017722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."draft_organize_organizationtype_enum" AS ENUM('PERSONAL', 'JURISTIC', 'REGISTER_INDIVIDUAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "draft_organize" ("id" SERIAL NOT NULL, "organizationType" "public"."draft_organize_organizationtype_enum" NOT NULL DEFAULT 'PERSONAL', "orgInfo" json, "contactInfo" json, "addressInfo" json, "organizeId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_283101c1141210a7f6533d0dad9" PRIMARY KEY ("id")); COMMENT ON COLUMN "draft_organize"."organizationType" IS 'organization type is PERSONAL , JURISTIC , PERSONAL COMMERCE'; COMMENT ON COLUMN "draft_organize"."orgInfo" IS 'organization info'; COMMENT ON COLUMN "draft_organize"."contactInfo" IS 'congtact info'; COMMENT ON COLUMN "draft_organize"."addressInfo" IS 'address info'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e803b3e1ea095ac85a99287d21" ON "draft_organize" ("organizeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" ADD "draft_organize_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" ADD "draftOrganizeId" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04e50b77bbb82007454de89707" ON "user_identity_documents" ("draft_organize_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_organize" ADD CONSTRAINT "FK_e803b3e1ea095ac85a99287d215" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" ADD CONSTRAINT "FK_a6f953d3ffe061cf2dbe0c87685" FOREIGN KEY ("draftOrganizeId") REFERENCES "draft_organize"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_organize" DROP CONSTRAINT "FK_e803b3e1ea095ac85a99287d215"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" DROP COLUMN "draftOrganizeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" DROP COLUMN "draft_organize_id"`,
    );
    await queryRunner.query(`DROP TABLE "draft_organize"`);
    await queryRunner.query(
      `DROP TYPE "public"."draft_organize_organizationtype_enum"`,
    );
  }
}
