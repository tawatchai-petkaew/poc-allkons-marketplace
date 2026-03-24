import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleToGroupNotification1659343923324
  implements MigrationInterface
{
  name = 'AddTitleToGroupNotification1659343923324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "title" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "title"`,
    );
  }
}
