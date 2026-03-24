import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopditValueType1711965316781 implements MigrationInterface {
  name = 'AddShopditValueType1711965316781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."shopdit_product_valuetype_enum" AS ENUM('increase', 'decrease')`
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_product" ADD "valueType" "public"."shopdit_product_valuetype_enum" NOT NULL DEFAULT 'decrease'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_product" DROP COLUMN "valueType"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."shopdit_product_valuetype_enum"`
    );
  }
}
