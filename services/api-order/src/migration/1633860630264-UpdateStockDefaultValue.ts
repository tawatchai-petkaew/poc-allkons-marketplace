import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStockDefaultValue1633860630264
  implements MigrationInterface
{
  name = 'UpdateStockDefaultValue1633860630264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" ALTER COLUMN "isServiceProduct" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ALTER COLUMN "onValidateStock" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" ALTER COLUMN "onValidateStock" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ALTER COLUMN "isServiceProduct" DROP DEFAULT`,
    );
  }
}
