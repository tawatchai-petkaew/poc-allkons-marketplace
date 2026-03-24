import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuspendedSkusOnProeductLazada1685517949073
  implements MigrationInterface {
  name = 'AddSuspendedSkusOnProeductLazada1685517949073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_lazada" ADD "suspendedSkus" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_lazada" DROP COLUMN "suspendedSkus"`
    );
  }
}
