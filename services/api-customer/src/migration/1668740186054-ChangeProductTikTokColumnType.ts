import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProductTikTokColumnType1668740186054
  implements MigrationInterface {
  name = 'ChangeProductTikTokColumnType1668740186054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP COLUMN "update_time"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD "update_time" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP COLUMN "create_time"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD "create_time" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP COLUMN "create_time"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD "create_time" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP COLUMN "update_time"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD "update_time" integer`
    );
  }
}
