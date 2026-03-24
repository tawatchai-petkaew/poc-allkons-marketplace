import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableConsentAndUserConsent1749712462077
  implements MigrationInterface
{
  name = 'CreateTableConsentAndUserConsent1749712462077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."consent_message_consenttype_enum" AS ENUM('privacy_policy', 'marketing_consent', 'agent_consent', 'manufacturer_consent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."consent_message_language_enum" AS ENUM('th', 'en')`,
    );
    await queryRunner.query(
      `CREATE TABLE "consent_message" ("id" SERIAL NOT NULL, "consentType" "public"."consent_message_consenttype_enum", "version" character varying(20) NOT NULL, "language" "public"."consent_message_language_enum" NOT NULL DEFAULT 'th', "content" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_04abc4e25dbb01ead9c20e0567a" UNIQUE ("consentType", "version", "language"), CONSTRAINT "PK_bcf0e9efbb5e6a26cf2ad9f4413" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_consent" ("id" SERIAL NOT NULL, "userId" integer, "consentMessageId" integer, "acceptedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_24a71dbf575fda4ff190c79f5e5" UNIQUE ("userId", "consentMessageId"), CONSTRAINT "PK_b22925348311c2e41cc80b05171" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_kycstatus_enum" AS ENUM('NONE', 'WAIT_FOR_APPROVE', 'REQUEST_MORE', 'APPROVE', 'REJECT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "kycStatus" "public"."user_kycstatus_enum" DEFAULT 'NONE'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."draft_profile_step_enum" RENAME TO "draft_profile_step_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_profile_step_enum" AS ENUM('NONE_REGISTER', 'REGISTER', 'USER_INFO', 'ORG_INFO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ALTER COLUMN "step" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ALTER COLUMN "step" TYPE "public"."draft_profile_step_enum" USING "step"::"text"::"public"."draft_profile_step_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ALTER COLUMN "step" SET DEFAULT 'NONE_REGISTER'`,
    );
    await queryRunner.query(`DROP TYPE "public"."draft_profile_step_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "user_consent" ADD CONSTRAINT "FK_3ca13251d989aa9f2cf5eff2126" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_consent" ADD CONSTRAINT "FK_869ec60f62c080d57e0e169a5d6" FOREIGN KEY ("consentMessageId") REFERENCES "consent_message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_consent" DROP CONSTRAINT "FK_869ec60f62c080d57e0e169a5d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_consent" DROP CONSTRAINT "FK_3ca13251d989aa9f2cf5eff2126"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_profile_step_enum_old" AS ENUM('ORG_INFO', 'USER_INFO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ALTER COLUMN "step" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ALTER COLUMN "step" TYPE "public"."draft_profile_step_enum_old" USING "step"::"text"::"public"."draft_profile_step_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ALTER COLUMN "step" SET DEFAULT 'USER_INFO'`,
    );
    await queryRunner.query(`DROP TYPE "public"."draft_profile_step_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."draft_profile_step_enum_old" RENAME TO "draft_profile_step_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "kycStatus"`);
    await queryRunner.query(`DROP TYPE "public"."user_kycstatus_enum"`);
    await queryRunner.query(`DROP TABLE "user_consent"`);
    await queryRunner.query(`DROP TABLE "consent_message"`);
    await queryRunner.query(
      `DROP TYPE "public"."consent_message_language_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."consent_message_consenttype_enum"`,
    );
  }
}
