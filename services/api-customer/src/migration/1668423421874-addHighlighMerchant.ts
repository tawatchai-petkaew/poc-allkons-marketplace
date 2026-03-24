import { MigrationInterface, QueryRunner } from 'typeorm';

export class addHighlighMerchant1668423421874 implements MigrationInterface {
  name = 'addHighlighMerchant1668423421874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" ADD "highlight" text`);
    await queryRunner.query(`ALTER TABLE "merchant" ADD "keyword" text array`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "keyword"`);
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "highlight"`);
  }
}
