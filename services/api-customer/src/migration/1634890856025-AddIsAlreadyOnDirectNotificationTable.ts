import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAlreadyOnDirectNotificationTable1634890856025
  implements MigrationInterface {
  name = 'AddIsAlreadyOnDirectNotificationTable1634890856025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD "isAlready" boolean DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP COLUMN "isAlready"`
    );
  }
}
