import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderItemAttributesAndProductKind1632796957120
  implements MigrationInterface {
  name = 'UpdateOrderItemAttributesAndProductKind1632796957120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "size"`);
    await queryRunner.query(
      `CREATE TYPE "product_kind_enum" AS ENUM('single', 'multiple', 'set', 'service')`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "kind" "product_kind_enum"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "product_kind_enum"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "size" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "color" character varying`
    );
  }
}
