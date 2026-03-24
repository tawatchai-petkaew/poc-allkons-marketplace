import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneWhiteListIndexes1761600000003
  implements MigrationInterface
{
  name = 'AddPhoneWhiteListIndexes1761600000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_phone_trgm" 
       ON "phone_white_list" USING gin("phoneNumber" gin_trgm_ops)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_phone_pattern" 
       ON "phone_white_list"("phoneNumber" varchar_pattern_ops)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_label_trgm" 
       ON "phone_white_list" USING gin(label gin_trgm_ops)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_label_pattern" 
       ON "phone_white_list"(label varchar_pattern_ops)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_is_active" 
       ON "phone_white_list"("isActive")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_created_at" 
       ON "phone_white_list"("createdAt" DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_org_active_created" 
       ON "phone_white_list"("organizationId", "isActive", "createdAt" DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_phone_white_list_phone_country" 
       ON "phone_white_list"("phoneNumber", "countryCode")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Dropping phone white list indexes...');

    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_phone_country"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_org_active_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_label_pattern"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_label_trgm"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_phone_pattern"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_phone_white_list_phone_trgm"`,
    );

    console.log('✅ All indexes dropped!');
  }
}
