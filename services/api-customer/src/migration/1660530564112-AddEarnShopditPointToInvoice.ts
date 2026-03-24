import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEarnShopditPointToInvoice1660530564112
  implements MigrationInterface {
  name = 'AddEarnShopditPointToInvoice1660530564112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "earnShopditPoint" double precision NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "earnShopditPoint"`
    );
  }
}
