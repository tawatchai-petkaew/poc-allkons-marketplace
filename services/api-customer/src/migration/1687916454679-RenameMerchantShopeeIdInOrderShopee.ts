import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMerchantShopeeIdInOrderShopee1687916454679
  implements MigrationInterface {
  name = 'RenameMerchantShopeeIdInOrderShopee1687916454679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shopee" DROP CONSTRAINT "FK_41fabedd12d16a4e86cc6ee290c"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" RENAME COLUMN "merchantShopeeId" TO "merchant_shopee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" ADD CONSTRAINT "FK_76e3fa76fc304cb5698c0b999fc" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shopee" DROP CONSTRAINT "FK_76e3fa76fc304cb5698c0b999fc"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" RENAME COLUMN "merchant_shopee_id" TO "merchantShopeeId"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" ADD CONSTRAINT "FK_41fabedd12d16a4e86cc6ee290c" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
