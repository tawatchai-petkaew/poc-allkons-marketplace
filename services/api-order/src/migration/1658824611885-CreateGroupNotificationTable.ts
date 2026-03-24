import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupNotificationTable1658824611885
  implements MigrationInterface
{
  name = 'CreateGroupNotificationTable1658824611885';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "group_notification_detailtype_enum" AS ENUM('allBroadcast', 'customerWithCartItemBroadcast')`,
    );
    await queryRunner.query(
      `CREATE TYPE "group_notification_receivertype_enum" AS ENUM('merchant', 'customer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_notification" ("id" SERIAL NOT NULL, "detailType" "group_notification_detailtype_enum" NOT NULL, "receiverType" "group_notification_receivertype_enum" NOT NULL, "message" text, "readCount" integer NOT NULL DEFAULT '0', "sentCount" integer NOT NULL DEFAULT '0', "releaseDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_42b45a2dc12c9bd6786a39d542a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD "groupNotificationId" integer`,
    );
    await queryRunner.query(
      `ALTER TYPE "direct_notification_detailtype_enum" RENAME TO "direct_notification_detailtype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum" AS ENUM('newOrder', 'payment', 'shipmentOrder', 'completeOrder', 'cancelOrder', 'productOutOfStock', 'verifyOrder', 'allBroadcast', 'customerWithCartItemBroadcast')`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ALTER COLUMN "detailType" TYPE "direct_notification_detailtype_enum" USING "detailType"::"text"::"direct_notification_detailtype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "direct_notification_detailtype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD CONSTRAINT "FK_374c48c6b9693be240409d058d9" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD CONSTRAINT "FK_0f2268a69194cffee48cb88024b" FOREIGN KEY ("groupNotificationId") REFERENCES "group_notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP CONSTRAINT "FK_0f2268a69194cffee48cb88024b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP CONSTRAINT "FK_374c48c6b9693be240409d058d9"`,
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum_old" AS ENUM('cancelOrder', 'completeOrder', 'newOrder', 'payment', 'productOutOfStock', 'shipmentOrder', 'verifyOrder')`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ALTER COLUMN "detailType" TYPE "direct_notification_detailtype_enum_old" USING "detailType"::"text"::"direct_notification_detailtype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "direct_notification_detailtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "direct_notification_detailtype_enum_old" RENAME TO "direct_notification_detailtype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP COLUMN "groupNotificationId"`,
    );
    await queryRunner.query(`DROP TABLE "group_notification"`);
    await queryRunner.query(`DROP TYPE "group_notification_receivertype_enum"`);
    await queryRunner.query(`DROP TYPE "group_notification_detailtype_enum"`);
  }
}
