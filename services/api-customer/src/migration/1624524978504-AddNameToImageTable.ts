import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToImageTable1624524978504 implements MigrationInterface {
  name = 'AddNameToImageTable1624524978504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload" ADD "name" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image_upload" DROP COLUMN "name"`);
  }
}
