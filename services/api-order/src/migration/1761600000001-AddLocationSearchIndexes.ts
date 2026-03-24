import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationSearchIndexes1761600000001
  implements MigrationInterface
{
  name = 'AddLocationSearchIndexes1761600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await queryRunner.query(
      `CREATE INDEX "IDX_province_name_th_trgm" ON "province" USING gin(name_th gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_province_name_th_pattern" ON "province"(name_th varchar_pattern_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_district_name_th_trgm" ON "district" USING gin(name_th gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_district_name_th_pattern" ON "district"(name_th varchar_pattern_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_district_province_id" ON "district"("provinceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_district_name_th_trgm" ON "sub_district" USING gin(name_th gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_district_name_th_pattern" ON "sub_district"(name_th varchar_pattern_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_district_zip_code" ON "sub_district"(zip_code)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_district_zip_pattern" ON "sub_district"(zip_code varchar_pattern_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_district_district_id" ON "sub_district"("districtId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_district_district_zip" ON "sub_district"("districtId", zip_code)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sub_district_district_zip"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sub_district_district_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sub_district_zip_pattern"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_sub_district_zip_code"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sub_district_name_th_pattern"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sub_district_name_th_trgm"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_district_province_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_district_name_th_pattern"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_district_name_th_trgm"`);

    await queryRunner.query(
      `DROP INDEX "public"."IDX_province_name_th_pattern"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_province_name_th_trgm"`);

    console.log('✅ All indexes dropped!');
  }
}
