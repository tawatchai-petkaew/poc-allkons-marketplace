import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailToAdminTable1634610490235 implements MigrationInterface {
  name = 'AddEmailToAdminTable1634610490235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "email" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "email"`);
  }
}
