import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToUserTable1624968080047 implements MigrationInterface {
  name = 'AddNameToUserTable1624968080047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload" ADD "size" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "image_upload" DROP COLUMN "size"`);
  }
}
