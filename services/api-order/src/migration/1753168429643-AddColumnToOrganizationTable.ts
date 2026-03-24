import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToOrganizationTable1753168429643
  implements MigrationInterface
{
  name = 'AddColumnToOrganizationTable1753168429643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "organizeNameEN" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "registerDate" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "status" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "registerDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "organizeNameEN"`,
    );
  }
}
