import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIndex1712286200261 implements MigrationInterface {
  name = 'RemoveIndex1712286200261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8cfaf4a1e80806d58e3dbe6922"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62fcc319202f6ec1f6819e1d5f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2abbb9df7a83bdc561cb1e6111"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_976ae0cbc46125630bfd1ecedd"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_976ae0cbc46125630bfd1ecedd" ON "merchant" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2abbb9df7a83bdc561cb1e6111" ON "product" ("slug", "merchantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62fcc319202f6ec1f6819e1d5f" ON "product" ("merchantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8cfaf4a1e80806d58e3dbe6922" ON "product" ("slug") `,
    );
  }
}
