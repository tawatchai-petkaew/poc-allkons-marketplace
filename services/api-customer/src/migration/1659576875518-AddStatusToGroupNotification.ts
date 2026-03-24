import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToGroupNotification1659576875518
  implements MigrationInterface {
  name = 'AddStatusToGroupNotification1659576875518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "group_notification_status_enum" AS ENUM('prepare', 'success', 'cancel')`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "status" "group_notification_status_enum" NOT NULL DEFAULT 'prepare'`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "imageUploadId" integer`
    );
    await queryRunner.query(
      `ALTER TYPE "group_notification_sourcetype_enum" RENAME TO "group_notification_sourcetype_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "group_notification_sourcetype_enum" AS ENUM('article', 'product', 'productCategory', 'productBrand', 'nonLink', 'home', 'productList', 'cart', 'favorite', 'couponList')`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ALTER COLUMN "sourceType" TYPE "group_notification_sourcetype_enum" USING "sourceType"::"text"::"group_notification_sourcetype_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "group_notification_sourcetype_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD CONSTRAINT "FK_5e4c0e149507a88efccb2b4ea43" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP CONSTRAINT "FK_5e4c0e149507a88efccb2b4ea43"`
    );
    await queryRunner.query(
      `CREATE TYPE "group_notification_sourcetype_enum_old" AS ENUM('article', 'product', 'productCategory', 'productBrand', 'nonLink')`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ALTER COLUMN "sourceType" TYPE "group_notification_sourcetype_enum_old" USING "sourceType"::"text"::"group_notification_sourcetype_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "group_notification_sourcetype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "group_notification_sourcetype_enum_old" RENAME TO "group_notification_sourcetype_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "imageUploadId"`
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "status"`
    );
    await queryRunner.query(`DROP TYPE "group_notification_status_enum"`);
  }
}
