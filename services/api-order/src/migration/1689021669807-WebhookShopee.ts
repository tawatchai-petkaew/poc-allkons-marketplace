import { MigrationInterface, QueryRunner } from 'typeorm';

export class webhookShopee1689021669807 implements MigrationInterface {
  name = 'webhookShopee1689021669807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "webhook_shopee" ("id" character varying NOT NULL, "shopee_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "data" jsonb NOT NULL, "merchant_shopee_id" character varying, CONSTRAINT "UQ_193191421cde1071acc669be215" UNIQUE ("id"), CONSTRAINT "PK_193191421cde1071acc669be215" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_shopee" ADD CONSTRAINT "FK_80c10326478cbb7b0a44c7e8554" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_shopee" DROP CONSTRAINT "FK_80c10326478cbb7b0a44c7e8554"`,
    );
    await queryRunner.query(`DROP TABLE "webhook_shopee"`);
  }
}
