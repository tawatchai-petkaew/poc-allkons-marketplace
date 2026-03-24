import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenExpiredAtToMerchantShopees1701112519268
  implements MigrationInterface
{
  name = 'AddRefreshTokenExpiredAtToMerchantShopees1701112519268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" ADD "refresh_token_expired_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shopee" DROP COLUMN "refresh_token_expired_at"`,
    );
  }
}
