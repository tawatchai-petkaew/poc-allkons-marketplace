import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderIdLazada1683711597726 implements MigrationInterface {
  name = 'UpdateOrderIdLazada1683711597726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_lazada" ADD "order_lazada_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_lazada" ADD CONSTRAINT "UQ_2ffed808d851c63eed140932635" UNIQUE ("order_lazada_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_lazada" DROP CONSTRAINT "UQ_2ffed808d851c63eed140932635"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_lazada" DROP COLUMN "order_lazada_id"`,
    );
  }
}
