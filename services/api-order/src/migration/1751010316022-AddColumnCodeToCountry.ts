import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnCodeToCountry1751010316022 implements MigrationInterface {
  name = 'AddColumnCodeToCountry1751010316022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_district" ADD "code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_district" ADD "zipCodeId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_district" DROP COLUMN "zipCodeId"`,
    );
    await queryRunner.query(`ALTER TABLE "sub_district" DROP COLUMN "code"`);
  }
}
