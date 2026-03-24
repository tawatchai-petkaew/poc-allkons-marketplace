import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvitationTable1759046882951 implements MigrationInterface {
  name = 'CreateInvitationTable1759046882951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invitations_status_enum" AS ENUM('NONE', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WAIT_FOR_APPROVE', 'CANCELLED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitations" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "phoneNumber" character varying(20) NOT NULL, "refCode" character varying(255) NOT NULL, "status" "public"."invitations_status_enum" NOT NULL DEFAULT 'WAIT_FOR_APPROVE', "addInWhiteList" boolean NOT NULL DEFAULT false, "merchantInfo" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, "acceptedAt" TIMESTAMP, "invitedByUserId" integer NOT NULL, "roleId" integer NOT NULL, "organizeId" integer NOT NULL, CONSTRAINT "UQ_e27fe271f042daf9f7378bb3994" UNIQUE ("refCode"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_invitation_ref_code" ON "invitations" ("refCode") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_organization_memberstatus_enum" RENAME TO "user_organization_memberstatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_organization_memberstatus_enum" AS ENUM('NONE', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WAIT_FOR_APPROVE', 'CANCELLED', 'REJECTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" TYPE "public"."user_organization_memberstatus_enum" USING "memberStatus"::"text"::"public"."user_organization_memberstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" SET DEFAULT 'NONE'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_organization_memberstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_b7423cfb362a842b7ea0a3763b9" FOREIGN KEY ("invitedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_7f2c37e6463b81cf0f2c72d2819" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_e473b0cd56488ff0ac18b5ba284" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_e473b0cd56488ff0ac18b5ba284"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_7f2c37e6463b81cf0f2c72d2819"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_b7423cfb362a842b7ea0a3763b9"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_organization_memberstatus_enum_old" AS ENUM('ACCEPTED', 'DECLINED', 'EXPIRED', 'NONE', 'SENT', 'WAIT_FOR_APPROVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" TYPE "public"."user_organization_memberstatus_enum_old" USING "memberStatus"::"text"::"public"."user_organization_memberstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" SET DEFAULT 'NONE'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_organization_memberstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_organization_memberstatus_enum_old" RENAME TO "user_organization_memberstatus_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_invitation_ref_code"`);
    await queryRunner.query(`DROP TABLE "invitations"`);
    await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
  }
}
