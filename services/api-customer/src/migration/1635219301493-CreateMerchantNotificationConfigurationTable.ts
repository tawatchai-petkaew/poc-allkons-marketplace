import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantNotificationConfigurationTable1635219301493
  implements MigrationInterface {
  name = 'CreateMerchantNotificationConfigurationTable1635219301493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_notification_admin_configuration" ("id" SERIAL NOT NULL, "isEmailNotifyNewOrder" boolean NOT NULL DEFAULT true, "isEmailNotifyPayment" boolean NOT NULL DEFAULT true, "isEmailNotifyCancelOrder" boolean NOT NULL DEFAULT true, "isEmailNotifyCompleteOrder" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantNotificationConfigurationId" integer, CONSTRAINT "REL_f4ec28dfbddb604cac30711a59" UNIQUE ("merchantNotificationConfigurationId"), CONSTRAINT "PK_8c61908737998fda36653ec6716" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_notification_customer_configuration" ("id" SERIAL NOT NULL, "isEmailNotifyNewOrder" boolean NOT NULL DEFAULT true, "isEmailNotifyPayment" boolean NOT NULL DEFAULT true, "isEmailNotifyCancelOrder" boolean NOT NULL DEFAULT true, "isEmailNotifyShipmentOrder" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantNotificationConfigurationId" integer, CONSTRAINT "REL_7eebdce80f60bfb94344a2e825" UNIQUE ("merchantNotificationConfigurationId"), CONSTRAINT "PK_8273b7ca0318fff5309c057db35" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_notification_configuration" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_b1d4e4a685bc4394c5a7c22296" UNIQUE ("merchantId"), CONSTRAINT "PK_91ca262fca0e3aa7c7d331b00a3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TYPE "direct_notification_detailtype_enum" RENAME TO "direct_notification_detailtype_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum" AS ENUM('newOrder', 'payment', 'shipmentOrder', 'completeOrder', 'cancelOrder', 'productOutOfStock')`
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ALTER COLUMN "detailType" TYPE "direct_notification_detailtype_enum" USING "detailType"::"text"::"direct_notification_detailtype_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "direct_notification_detailtype_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_notification_admin_configuration" ADD CONSTRAINT "FK_f4ec28dfbddb604cac30711a591" FOREIGN KEY ("merchantNotificationConfigurationId") REFERENCES "merchant_notification_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_notification_customer_configuration" ADD CONSTRAINT "FK_7eebdce80f60bfb94344a2e8256" FOREIGN KEY ("merchantNotificationConfigurationId") REFERENCES "merchant_notification_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_notification_configuration" ADD CONSTRAINT "FK_b1d4e4a685bc4394c5a7c222968" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_notification_configuration" DROP CONSTRAINT "FK_b1d4e4a685bc4394c5a7c222968"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_notification_customer_configuration" DROP CONSTRAINT "FK_7eebdce80f60bfb94344a2e8256"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_notification_admin_configuration" DROP CONSTRAINT "FK_f4ec28dfbddb604cac30711a591"`
    );
    await queryRunner.query(
      `CREATE TYPE "direct_notification_detailtype_enum_old" AS ENUM('newOrder', 'payment', 'completeOrder', 'cancelOrder', 'productOutOfStock')`
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ALTER COLUMN "detailType" TYPE "direct_notification_detailtype_enum_old" USING "detailType"::"text"::"direct_notification_detailtype_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "direct_notification_detailtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "direct_notification_detailtype_enum_old" RENAME TO "direct_notification_detailtype_enum"`
    );
    await queryRunner.query(`DROP TABLE "merchant_notification_configuration"`);
    await queryRunner.query(
      `DROP TABLE "merchant_notification_customer_configuration"`
    );
    await queryRunner.query(
      `DROP TABLE "merchant_notification_admin_configuration"`
    );
  }
}
