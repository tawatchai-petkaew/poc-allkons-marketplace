import { MigrationInterface, QueryRunner } from 'typeorm';

export class DelStageCISCompleted1756223902146 implements MigrationInterface {
  name = 'DelStageCISCompleted1756223902146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_organize" DROP COLUMN "addressSendCIS"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_organize" ADD "addressSendCIS" boolean NOT NULL DEFAULT false`,
    );
  }
}
