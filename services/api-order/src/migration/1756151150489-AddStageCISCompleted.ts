import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStageCISCompleted1756151150489 implements MigrationInterface {
  name = 'AddStageCISCompleted1756151150489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_organize" ADD "addressSendCIS" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_organize" DROP COLUMN "addressSendCIS"`,
    );
  }
}
