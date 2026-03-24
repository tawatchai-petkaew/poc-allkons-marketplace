import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMerchantKind1715831320245 implements MigrationInterface {
  name = 'addMerchantKind1715831320245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_kind_enum" AS ENUM('shopdit', 'entertainment')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "kind" "public"."merchant_kind_enum" NOT NULL DEFAULT 'shopdit'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "public"."merchant_kind_enum"`);
  }
}
