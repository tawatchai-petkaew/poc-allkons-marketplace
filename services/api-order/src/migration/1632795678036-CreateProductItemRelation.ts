import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductItemRelation1632795678036
  implements MigrationInterface
{
  name = 'CreateProductItemRelation1632795678036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "productItemId" integer`,
    );
    await queryRunner.query(`ALTER TABLE "stock" ADD "productItemId" integer`);
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "UQ_e03b01797e765d1216d631dfc9e" UNIQUE ("productItemId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_93f96423791579a4489a72461a4" FOREIGN KEY ("productItemId") REFERENCES "product_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "FK_e03b01797e765d1216d631dfc9e" FOREIGN KEY ("productItemId") REFERENCES "product_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "FK_e03b01797e765d1216d631dfc9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_93f96423791579a4489a72461a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "UQ_e03b01797e765d1216d631dfc9e"`,
    );
    await queryRunner.query(`ALTER TABLE "stock" DROP COLUMN "productItemId"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "productItemId"`,
    );
  }
}
