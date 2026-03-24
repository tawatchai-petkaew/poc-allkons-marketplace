import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductBigUnitDiscountAndAddBigUnitPrice1643164810018
  implements MigrationInterface {
  name = 'CreateProductBigUnitDiscountAndAddBigUnitPrice1643164810018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "product_big_unit_discount_type_enum" AS ENUM('remain', 'decrease')`
    );
    await queryRunner.query(
      `CREATE TYPE "product_big_unit_discount_unittype_enum" AS ENUM('bath', 'percent')`
    );
    await queryRunner.query(
      `CREATE TABLE "product_big_unit_discount" ("id" SERIAL NOT NULL, "type" "product_big_unit_discount_type_enum" NOT NULL DEFAULT 'decrease', "unitType" "product_big_unit_discount_unittype_enum" NOT NULL DEFAULT 'bath', "value" integer NOT NULL, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_d0ac22e6c7976f2c6857f66d20a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD "bigUnitPrice" double precision`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD "productBigUnitDiscountId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD CONSTRAINT "UQ_9d00efe63d47be9b794c036795c" UNIQUE ("productBigUnitDiscountId")`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD CONSTRAINT "FK_9d00efe63d47be9b794c036795c" FOREIGN KEY ("productBigUnitDiscountId") REFERENCES "product_big_unit_discount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP CONSTRAINT "FK_9d00efe63d47be9b794c036795c"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP CONSTRAINT "UQ_9d00efe63d47be9b794c036795c"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP COLUMN "productBigUnitDiscountId"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP COLUMN "bigUnitPrice"`
    );
    await queryRunner.query(`DROP TABLE "product_big_unit_discount"`);
    await queryRunner.query(
      `DROP TYPE "product_big_unit_discount_unittype_enum"`
    );
    await queryRunner.query(`DROP TYPE "product_big_unit_discount_type_enum"`);
  }
}
