import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeOfPriceOrderItem1669604221581
  implements MigrationInterface {
  name = 'ChangeTypeOfPriceOrderItem1669604221581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" ALTER COLUMN "price" TYPE double precision`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "minFinalProductPrice" TYPE double precision`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "maxFinalProductPrice" TYPE double precision`
    );
    await queryRunner.query(
      `ALTER TABLE "product_discount" ALTER COLUMN "value" TYPE double precision`
    );
    await queryRunner.query(
      `ALTER TABLE "product_big_unit_discount" ALTER COLUMN "value" TYPE double precision`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "maxFinalProductPrice" TYPE integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "minFinalProductPrice" TYPE integer`
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ALTER COLUMN "price" TYPE integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product_discount" ALTER COLUMN "value" TYPE integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product_big_unit_discount" ALTER COLUMN "value" TYPE integer`
    );
  }
}
