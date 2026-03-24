import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteQuantityOnFlashsale1646291583325
  implements MigrationInterface {
  name = 'DeleteQuantityOnFlashsale1646291583325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" DROP COLUMN "quantity"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_flash_sale" ADD "quantity" integer NOT NULL DEFAULT '0'`
    );
  }
}
