import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteSetNull1690436899295 implements MigrationInterface {
  name = 'AddOnDeleteSetNull1690436899295';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shopee" DROP CONSTRAINT "FK_76e3fa76fc304cb5698c0b999fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_a0a0c5397b28529ed61129149ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" DROP CONSTRAINT "FK_4804679303bd4441296a595adbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_shopee" DROP CONSTRAINT "FK_80c10326478cbb7b0a44c7e8554"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" ADD CONSTRAINT "FK_76e3fa76fc304cb5698c0b999fc" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_a0a0c5397b28529ed61129149ad" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" ADD CONSTRAINT "FK_4804679303bd4441296a595adbe" FOREIGN KEY ("product_shopee_id") REFERENCES "product_shopee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_shopee" ADD CONSTRAINT "FK_80c10326478cbb7b0a44c7e8554" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_shopee" DROP CONSTRAINT "FK_80c10326478cbb7b0a44c7e8554"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" DROP CONSTRAINT "FK_4804679303bd4441296a595adbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" DROP CONSTRAINT "FK_a0a0c5397b28529ed61129149ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" DROP CONSTRAINT "FK_76e3fa76fc304cb5698c0b999fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_shopee" ADD CONSTRAINT "FK_80c10326478cbb7b0a44c7e8554" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" ADD CONSTRAINT "FK_4804679303bd4441296a595adbe" FOREIGN KEY ("product_shopee_id") REFERENCES "product_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee" ADD CONSTRAINT "FK_a0a0c5397b28529ed61129149ad" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_shopee" ADD CONSTRAINT "FK_76e3fa76fc304cb5698c0b999fc" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
