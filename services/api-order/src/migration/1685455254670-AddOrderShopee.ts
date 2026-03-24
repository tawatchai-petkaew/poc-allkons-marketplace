import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOrderShopee1685455254670 implements MigrationInterface {
  name = 'addOrderShopee1685455254670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_shopee" ("id" character varying NOT NULL, "shopee_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "data" jsonb NOT NULL, "merchantShopeeId" character varying, CONSTRAINT "UQ_ee9f990e0e16287d89257dcb628" UNIQUE ("id"), CONSTRAINT "PK_ee9f990e0e16287d89257dcb628" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" ADD CONSTRAINT "FK_41fabedd12d16a4e86cc6ee290c" FOREIGN KEY ("merchantShopeeId") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shopee" DROP CONSTRAINT "FK_41fabedd12d16a4e86cc6ee290c"`,
    );
    await queryRunner.query(`DROP TABLE "order_shopee"`);
  }
}
