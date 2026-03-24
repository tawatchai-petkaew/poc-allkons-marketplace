import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateImageNameColumn1640140492995 implements MigrationInterface {
  name = 'UpdateImageNameColumn1640140492995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload" ADD "imageName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload" DROP COLUMN "imageName"`,
    );
  }
}
