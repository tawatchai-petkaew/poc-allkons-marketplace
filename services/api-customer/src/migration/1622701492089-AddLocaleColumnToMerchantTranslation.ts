import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocaleColumnToMerchantTranslation1622701492089
  implements MigrationInterface {
  name = 'AddLocaleColumnToMerchantTranslation1622701492089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" ADD "locale" character varying NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" DROP COLUMN "locale"`
    );
  }
}
