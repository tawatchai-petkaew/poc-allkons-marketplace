import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderSourceColumn1629707834693 implements MigrationInterface {
  name = 'AddOrderSourceColumn1629707834693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_source_enum" AS ENUM('mobileWebsite', 'mobileApp', 'desktopWebsite', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "source" "order_source_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "paymentMethodType" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" ALTER COLUMN "paymentMethodType" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "order_source_enum"`);
  }
}
