import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLineNotificationWithCancelOrder1664377036027
  implements MigrationInterface
{
  name = 'AddLineNotificationWithCancelOrder1664377036027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "line_notification" ADD "isNotifyCancelOrder" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "line_notification" DROP COLUMN "isNotifyCancelOrder"`,
    );
  }
}
