import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantTikTokTable1666887636622
  implements MigrationInterface
{
  name = 'CreateMerchantTikTokTable1666887636622';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_tik_tok" ("id" SERIAL NOT NULL, "authCode" character varying, "accessToken" character varying, "accessTokenExpireIn" integer, "refreshToken" character varying, "refreshTokenExpireIn" integer, "shopId" character varying, "shopName" character varying, "region" character varying, "type" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_cf6bbb130fae9f2b2e7f425e98" UNIQUE ("merchantId"), CONSTRAINT "PK_5d22a121d9a893d9754ff173018" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" ADD CONSTRAINT "FK_cf6bbb130fae9f2b2e7f425e98c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_tik_tok" DROP CONSTRAINT "FK_cf6bbb130fae9f2b2e7f425e98c"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_tik_tok"`);
  }
}
