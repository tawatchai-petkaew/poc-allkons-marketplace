import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForUserOrganizationPerformanceEntity1730881000000
  implements MigrationInterface
{
  name = 'AddIndexesForUserOrganizationPerformanceEntity1730881000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pg_trgm extension for trigram search
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // 1. GIN trigram index for Thai full name search (best for LIKE %search%)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_fullname_th_trgm"
       ON "user" USING gin ((LOWER("firstNameTh" || ' ' || "lastNameTh")) gin_trgm_ops)`,
    );

    // 2. GIN trigram index for English full name search  
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_fullname_en_trgm"
       ON "user" USING gin ((LOWER("firstNameEn" || ' ' || "lastNameEn")) gin_trgm_ops)`,
    );

    // 3. GIN trigram index for email search (case-insensitive)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_email_trgm"
       ON "user" USING gin (LOWER("email") gin_trgm_ops)`,
    );

    // 4. Composite index for phone search with country code
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_phone_search"
       ON "user" ("countryCode", "tel")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_phone_search"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_email_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_fullname_en_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_fullname_th_trgm"`);
  }
}