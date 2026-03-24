import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnableFlashSaleToGlobalConfigTable1677832447670
  implements MigrationInterface
{
  name = 'AddEnableFlashSaleToGlobalConfigTable1677832447670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" ADD "enableFlashsalePortal" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" DROP COLUMN "enableFlashsalePortal"`,
    );
  }
}
