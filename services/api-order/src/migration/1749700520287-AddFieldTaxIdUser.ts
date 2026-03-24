import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldTaxIdUser1749700520287 implements MigrationInterface {
  name = 'addTaxId1749700520287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "taxId" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "taxId"`);
  }
}
