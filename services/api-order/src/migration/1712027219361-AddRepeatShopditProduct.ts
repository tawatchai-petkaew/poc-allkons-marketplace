import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRepeatShopditProduct1712027219361
  implements MigrationInterface
{
  name = 'AddRepeatShopditProduct1712027219361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_product" ADD "canRepeated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_product" ADD "addOnWhitelist" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_product" DROP COLUMN "addOnWhitelist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shopdit_product" DROP COLUMN "canRepeated"`,
    );
  }
}
