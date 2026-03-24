import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConsentMessageIndexes1761600000000 implements MigrationInterface {
  name = 'AddConsentMessageIndexes1761600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await queryRunner.query(
      `CREATE INDEX "IDX_consent_message_type_lang_created" ON "consent_message" ("consentType", "language", "createdAt" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consent_message_type_version_lang" ON "consent_message" ("consentType", "version", "language")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consent_message_type" ON "consent_message" ("consentType")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consent_message_language" ON "consent_message" ("language")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_consent_message_language"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_consent_message_type"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_consent_message_type_version_lang"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_consent_message_type_lang_created"`
    );
  }
}