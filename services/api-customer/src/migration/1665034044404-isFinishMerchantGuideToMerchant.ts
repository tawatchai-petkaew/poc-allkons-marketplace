import { MigrationInterface, QueryRunner } from 'typeorm';

export class isFinishMerchantGuideToMerchant1665034044404
  implements MigrationInterface {
  name = 'isFinishMerchantGuideToMerchant1665034044404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "isFinishMerchantGuide" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "isFinishMerchantGuide"`
    );
  }
}
