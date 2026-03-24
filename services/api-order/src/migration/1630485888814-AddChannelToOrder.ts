import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChannelToOrder1630485888814 implements MigrationInterface {
  name = 'AddChannelToOrder1630485888814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" RENAME COLUMN "source" TO "channel"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."order_source_enum" RENAME TO "order_channel_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "order_channel_enum" RENAME TO "order_channel_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_channel_enum" AS ENUM('mobileWebsite', 'IosApp', 'AndroidApp', 'desktopWebsite', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "channel" TYPE "order_channel_enum" USING "channel"::"text"::"order_channel_enum"`,
    );
    await queryRunner.query(`DROP TYPE "order_channel_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_channel_enum_old" AS ENUM('mobileWebsite', 'mobileApp', 'desktopWebsite', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "channel" TYPE "order_channel_enum_old" USING "channel"::"text"::"order_channel_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "order_channel_enum"`);
    await queryRunner.query(
      `ALTER TYPE "order_channel_enum_old" RENAME TO "order_channel_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "order_channel_enum" RENAME TO "order_source_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" RENAME COLUMN "channel" TO "source"`,
    );
  }
}
