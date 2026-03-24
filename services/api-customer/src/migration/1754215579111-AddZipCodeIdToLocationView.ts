import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddZipCodeIdToLocationView1754215579111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE VIEW location_view AS
      SELECT
        sd.id AS subdistrict_id,
        sd.name_th AS subdistrict,
        d.id AS district_id,
        d.name_th AS district,
        p.id AS province_id,
        p.name_th AS province,
        sd.zip_code,
        sd."zipCodeId" AS zip_code_id
      FROM sub_district sd
      JOIN district d ON sd."districtId" = d.id
      JOIN province p ON d."provinceId" = p.id
      WHERE sd.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND p.deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE VIEW location_view AS
      SELECT
        sd.id AS subdistrict_id,
        sd.name_th AS subdistrict,
        d.id AS district_id,
        d.name_th AS district,
        p.id AS province_id,
        p.name_th AS province,
        sd.zip_code
      FROM sub_district sd
      JOIN district d ON sd."districtId" = d.id
      JOIN province p ON d."provinceId" = p.id
      WHERE sd.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND p.deleted_at IS NULL;
    `);
  }
}
