import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToGroupNotification1659317345383
  implements MigrationInterface
{
  name = 'AddNameToGroupNotification1659317345383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "name" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "name"`,
    );
  }
}
