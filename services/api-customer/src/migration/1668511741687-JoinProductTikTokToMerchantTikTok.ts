import { MigrationInterface, QueryRunner } from 'typeorm';

export class JoinProductTikTokToMerchantTikTok1668511741687
  implements MigrationInterface {
  name = 'JoinProductTikTokToMerchantTikTok1668511741687';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD "merchantTikTokId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" ADD CONSTRAINT "FK_9b4e4e46b386872d4050ad15db2" FOREIGN KEY ("merchantTikTokId") REFERENCES "merchant_tik_tok"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP CONSTRAINT "FK_9b4e4e46b386872d4050ad15db2"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_tik_tok" DROP COLUMN "merchantTikTokId"`
    );
  }
}
