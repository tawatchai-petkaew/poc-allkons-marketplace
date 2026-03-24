import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductModel1674676854223 implements MigrationInterface {
  name = 'AddProductModel1674676854223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "model" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "model"`);
  }
}
