import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUniqueFromProductShopeeSkus1672796174536
  implements MigrationInterface {
  name = 'removeUniqueFromProductShopeeSkus1672796174536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "UQ_2aa884cc6f9ecb9e22b638e04c3"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "UQ_2aa884cc6f9ecb9e22b638e04c3" UNIQUE ("sku")`
    );
  }
}
