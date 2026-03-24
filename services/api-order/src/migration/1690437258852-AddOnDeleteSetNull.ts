import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteSetNull1690437258852 implements MigrationInterface {
  name = 'AddOnDeleteSetNull1690437258852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" DROP CONSTRAINT "FK_762761701ca79dc71af26ed33e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" ADD CONSTRAINT "FK_762761701ca79dc71af26ed33e7" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" DROP CONSTRAINT "FK_762761701ca79dc71af26ed33e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shopee_item" ADD CONSTRAINT "FK_762761701ca79dc71af26ed33e7" FOREIGN KEY ("merchant_shopee_id") REFERENCES "merchant_shopee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
