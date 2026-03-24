import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnumConsentType1750314791579 implements MigrationInterface {
  name = 'AddEnumConsentType1750314791579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "consent_message" DROP CONSTRAINT "UQ_04abc4e25dbb01ead9c20e0567a"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."consent_message_consenttype_enum" RENAME TO "consent_message_consenttype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."consent_message_consenttype_enum" AS ENUM('privacy_policy', 'marketing_consent', 'agent_consent', 'manufacturer_consent', 'cookie_consent', 'terms_of_service')`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_message" ALTER COLUMN "consentType" TYPE "public"."consent_message_consenttype_enum" USING "consentType"::"text"::"public"."consent_message_consenttype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."consent_message_consenttype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_message" ADD CONSTRAINT "UQ_04abc4e25dbb01ead9c20e0567a" UNIQUE ("consentType", "version", "language")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "consent_message" DROP CONSTRAINT "UQ_04abc4e25dbb01ead9c20e0567a"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."consent_message_consenttype_enum_old" AS ENUM('privacy_policy', 'marketing_consent', 'agent_consent', 'manufacturer_consent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_message" ALTER COLUMN "consentType" TYPE "public"."consent_message_consenttype_enum_old" USING "consentType"::"text"::"public"."consent_message_consenttype_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."consent_message_consenttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."consent_message_consenttype_enum_old" RENAME TO "consent_message_consenttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_message" ADD CONSTRAINT "UQ_04abc4e25dbb01ead9c20e0567a" UNIQUE ("consentType", "version", "language")`,
    );
  }
}
