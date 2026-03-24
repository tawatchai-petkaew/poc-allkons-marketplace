import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductItemIdTikTokToProductItem1669042791097
  implements MigrationInterface {
  name = 'AddProductItemIdTikTokToProductItem1669042791097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_item" ADD "productItemIdTikTok" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_item" DROP COLUMN "productItemIdTikTok"`
    );
  }
}
