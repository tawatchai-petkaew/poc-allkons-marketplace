import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSourceIdTypeOnGroupNotification1661314293368
  implements MigrationInterface {
  name = 'ChangeSourceIdTypeOnGroupNotification1661314293368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "sourceId"`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "sourceId" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "sourceId"`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "sourceId" integer`
    );
  }
}
