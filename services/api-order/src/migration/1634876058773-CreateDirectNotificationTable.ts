import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDirectNotificationTable1634876058773
  implements MigrationInterface
{
  name = 'CreateDirectNotificationTable1634876058773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "line_notification_status_enum" AS ENUM('active', 'inActive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "line_notification" ("id" SERIAL NOT NULL, "status" "line_notification_status_enum" NOT NULL DEFAULT 'inActive', "token" text NOT NULL, "isNotifyNewOrder" boolean NOT NULL DEFAULT true, "isNotifyPayment" boolean NOT NULL DEFAULT true, "isNotifyProductOutOfStock" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_2a33a512cf5049b199208ac0f5" UNIQUE ("merchantId"), CONSTRAINT "PK_4c43c5b61586ed44f9f2f6a4b73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum" AS ENUM('newOrder', 'payment', 'completeOrder', 'cancelOrder', 'productOutOfStock')`,
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_receivertype_enum" AS ENUM('merchant', 'csutomer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "direct_notification" ("id" SERIAL NOT NULL, "detailType" "direct_notification_detailtype_enum" NOT NULL, "receiverType" "direct_notification_receivertype_enum" NOT NULL, "message" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productItemId" integer, "orderId" integer, "lineNotificationId" integer, "merchantId" integer, CONSTRAINT "PK_b08e4a50c7bc1864290269f9722" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "line_notification" ADD CONSTRAINT "FK_2a33a512cf5049b199208ac0f56" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD CONSTRAINT "FK_9e7cfc2f4a19e4dd08585a56df2" FOREIGN KEY ("productItemId") REFERENCES "product_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD CONSTRAINT "FK_dd541c067438a6ac83676f398db" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD CONSTRAINT "FK_48fd2943dc7c6a948b98751f913" FOREIGN KEY ("lineNotificationId") REFERENCES "line_notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD CONSTRAINT "FK_f9d1443d7e0c1dce1bf778c532c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP CONSTRAINT "FK_f9d1443d7e0c1dce1bf778c532c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP CONSTRAINT "FK_48fd2943dc7c6a948b98751f913"`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP CONSTRAINT "FK_dd541c067438a6ac83676f398db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP CONSTRAINT "FK_9e7cfc2f4a19e4dd08585a56df2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "line_notification" DROP CONSTRAINT "FK_2a33a512cf5049b199208ac0f56"`,
    );
    await queryRunner.query(`DROP TABLE "direct_notification"`);
    await queryRunner.query(
      `DROP TYPE "direct_notification_receivertype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "direct_notification_detailtype_enum"`);
    await queryRunner.query(`DROP TABLE "line_notification"`);
    await queryRunner.query(`DROP TYPE "line_notification_status_enum"`);
  }
}
