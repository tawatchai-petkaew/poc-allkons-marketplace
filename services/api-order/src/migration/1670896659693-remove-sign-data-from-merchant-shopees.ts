import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeSignDataFromMerchantShopees1670896659693
  implements MigrationInterface
{
  name = 'removeSignDataFromMerchantShopees1670896659693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "signData"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_sync_shopee" DROP CONSTRAINT "FK_9c737aaf9b4c0f7d68ecda1aeef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "UQ_2a085173136b019c66ec01bb548" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_sync_shopee" ADD CONSTRAINT "FK_9c737aaf9b4c0f7d68ecda1aeef" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_sync_shopee" DROP CONSTRAINT "FK_9c737aaf9b4c0f7d68ecda1aeef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "UQ_2a085173136b019c66ec01bb548"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_5f0c28a67fd36ea93dadbf9d162" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_sync_shopee" ADD CONSTRAINT "FK_9c737aaf9b4c0f7d68ecda1aeef" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "signData" character varying NOT NULL`,
    );
  }
}
