import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceType1718603860813 implements MigrationInterface {
  name = 'AddPerformanceType1718603860813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_performancemode_enum" AS ENUM('normal', 'performance')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "performanceMode" "public"."merchant_performancemode_enum" NOT NULL DEFAULT 'normal'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "performanceMode"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_performancemode_enum"`
    );
  }
}
