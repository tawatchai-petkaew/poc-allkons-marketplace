import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOnDeleteProductOption1632820175830
  implements MigrationInterface
{
  name = 'UpdateOnDeleteProductOption1632820175830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_5fd709edaf1c67fbd0e852534fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_fcf5c4d74f66848fe245ba9abc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_5fd709edaf1c67fbd0e852534fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "productPrimaryOptionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_fcf5c4d74f66848fe245ba9abc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "productSecondaryOptionId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "productSecondaryOptionId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_fcf5c4d74f66848fe245ba9abc1" UNIQUE ("productSecondaryOptionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "productPrimaryOptionId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_5fd709edaf1c67fbd0e852534fc" UNIQUE ("productPrimaryOptionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_fcf5c4d74f66848fe245ba9abc1" FOREIGN KEY ("productSecondaryOptionId") REFERENCES "product_secondary_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_5fd709edaf1c67fbd0e852534fc" FOREIGN KEY ("productPrimaryOptionId") REFERENCES "product_primary_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
