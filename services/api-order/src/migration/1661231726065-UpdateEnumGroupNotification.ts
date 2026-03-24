import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnumGroupNotification1661231726065
  implements MigrationInterface
{
  name = 'UpdateEnumGroupNotification1661231726065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "group_notification_sourcetype_enum" RENAME TO "group_notification_sourcetype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "group_notification_sourcetype_enum" AS ENUM('article', 'product', 'productCategory', 'productBrand', 'productCatalog', 'nonLink', 'home', 'productList', 'cart', 'favorite', 'couponList')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ALTER COLUMN "sourceType" TYPE "group_notification_sourcetype_enum" USING "sourceType"::"text"::"group_notification_sourcetype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "group_notification_sourcetype_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "group_notification_sourcetype_enum_old" AS ENUM('article', 'cart', 'couponList', 'favorite', 'home', 'nonLink', 'product', 'productBrand', 'productCategory', 'productList')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ALTER COLUMN "sourceType" TYPE "group_notification_sourcetype_enum_old" USING "sourceType"::"text"::"group_notification_sourcetype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "group_notification_sourcetype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "group_notification_sourcetype_enum_old" RENAME TO "group_notification_sourcetype_enum"`,
    );
  }
}
