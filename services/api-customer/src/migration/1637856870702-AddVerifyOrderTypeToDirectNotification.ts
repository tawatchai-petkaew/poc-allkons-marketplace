import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerifyOrderTypeToDirectNotification1637856870702
  implements MigrationInterface {
  name = 'AddVerifyOrderTypeToDirectNotification1637856870702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "direct_notification_detailtype_enum" RENAME TO "direct_notification_detailtype_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum" AS ENUM('newOrder', 'payment', 'shipmentOrder', 'completeOrder', 'cancelOrder', 'productOutOfStock', 'verifyOrder')`
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ALTER COLUMN "detailType" TYPE "direct_notification_detailtype_enum" USING "detailType"::"text"::"direct_notification_detailtype_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "direct_notification_detailtype_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum_old" AS ENUM('newOrder', 'payment', 'shipmentOrder', 'completeOrder', 'cancelOrder', 'productOutOfStock')`
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ALTER COLUMN "detailType" TYPE "direct_notification_detailtype_enum_old" USING "detailType"::"text"::"direct_notification_detailtype_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "direct_notification_detailtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "direct_notification_detailtype_enum_old" RENAME TO "direct_notification_detailtype_enum"`
    );
  }
}
