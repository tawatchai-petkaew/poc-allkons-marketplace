import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemarkKycColumn1760108345230 implements MigrationInterface {
  name = 'AddRemarkKycColumn1760108345230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "remarkKyc" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "remarkKyc"`);
  }
}
