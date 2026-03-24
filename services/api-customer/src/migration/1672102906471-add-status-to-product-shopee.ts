import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStatusToProductShopee1672102906471
  implements MigrationInterface {
  name = 'addStatusToProductShopee1672102906471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "product_shopee_status_enum" AS ENUM('NORMAL', 'BANNED', 'DELETED', 'UNLIST')`
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD "status" "product_shopee_status_enum" NOT NULL DEFAULT 'UNLIST'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP COLUMN "status"`
    );
    await queryRunner.query(`DROP TYPE "product_shopee_status_enum"`);
  }
}
