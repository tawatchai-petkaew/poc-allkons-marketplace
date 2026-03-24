import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddshopditPaymerchantIdToMerchant1662023937901
  implements MigrationInterface {
  name = 'AddshopditPaymerchantIdToMerchant1662023937901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "shopditPayMerchantId" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "shopditPayMerchantId"`
    );
  }
}
