import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceToGroupNotification1659318323158
  implements MigrationInterface
{
  name = 'AddSourceToGroupNotification1659318323158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "group_notification_sourcetype_enum" AS ENUM('article', 'product', 'productCategory', 'productBrand', 'nonLink')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "sourceType" "group_notification_sourcetype_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" ADD "sourceId" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "sourceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_notification" DROP COLUMN "sourceType"`,
    );
    await queryRunner.query(`DROP TYPE "group_notification_sourcetype_enum"`);
  }
}
