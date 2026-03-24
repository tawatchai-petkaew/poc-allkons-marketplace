import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToMerchantTranslationTable1622787640230
  implements MigrationInterface {
  name = 'AddDeletedAtToMerchantTranslationTable1622787640230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" ADD "deleted_at" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" DROP COLUMN "deleted_at"`
    );
  }
}
