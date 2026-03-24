import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToOrganizationTable1755623050400
  implements MigrationInterface
{
  name = 'AddColumnToOrganizationTable1755623050400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "remarkKyc" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "remarkKyc"`,
    );
  }
}
