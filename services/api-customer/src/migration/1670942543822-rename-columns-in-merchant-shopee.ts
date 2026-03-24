import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameColumnsInMerchantShopee1670942543822
  implements MigrationInterface {
  name = 'renameColumnsInMerchantShopee1670942543822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "FK_9d3ab7e91bb52bd97e289f18d98"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "REL_9d3ab7e91bb52bd97e289f18d9"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "merchantId"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "createdAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "updatedAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "merchant_id" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "UQ_91795a67bafc40c3aa7ddf364f9" UNIQUE ("merchant_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "FK_91795a67bafc40c3aa7ddf364f9" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "FK_91795a67bafc40c3aa7ddf364f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP CONSTRAINT "UQ_91795a67bafc40c3aa7ddf364f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "merchant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "merchantId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "REL_9d3ab7e91bb52bd97e289f18d9" UNIQUE ("merchantId")`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD CONSTRAINT "FK_9d3ab7e91bb52bd97e289f18d98" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
