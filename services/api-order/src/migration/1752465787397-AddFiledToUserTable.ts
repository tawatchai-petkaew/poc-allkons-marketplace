import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFiledToUserTable1752465787397 implements MigrationInterface {
  name = 'AddFiledToUserTable1752465787397';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isSeller" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isSeller"`);
  }
}
