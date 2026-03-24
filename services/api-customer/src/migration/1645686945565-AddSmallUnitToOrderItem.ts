import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSmallUnitToOrderItem1645686945565
  implements MigrationInterface {
  name = 'AddSmallUnitToOrderItem1645686945565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "smallUnitQuantity" integer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "smallUnitQuantity"`
    );
  }
}
