import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTelToUserTable1627272150237 implements MigrationInterface {
  name = 'AddTelToUserTable1627272150237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "countryCode" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "tel" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tel"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "countryCode"`);
  }
}
