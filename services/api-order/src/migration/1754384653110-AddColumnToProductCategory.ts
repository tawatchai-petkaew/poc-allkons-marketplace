import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToProductCategory1754384653110
  implements MigrationInterface
{
  name = 'AddColumnToProductCategory1754384653110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD "path" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD "skuId" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e0f84f926a4606a6529b477014" ON "product_category" ("path") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e0f84f926a4606a6529b477014"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP COLUMN "skuId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP COLUMN "path"`,
    );
  }
}
