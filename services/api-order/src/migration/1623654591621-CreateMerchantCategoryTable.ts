import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantCategoryTable1623654591621
  implements MigrationInterface
{
  name = 'CreateMerchantCategoryTable1623654591621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_193eb59c92e574470923f86c469" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "merchantCategoryId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD CONSTRAINT "FK_6ec54f1147d433ff5bcf630e34a" FOREIGN KEY ("merchantCategoryId") REFERENCES "merchant_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP CONSTRAINT "FK_6ec54f1147d433ff5bcf630e34a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "merchantCategoryId"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_category"`);
  }
}
