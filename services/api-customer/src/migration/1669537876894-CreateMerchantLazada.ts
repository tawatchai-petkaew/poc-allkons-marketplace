import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantLazada1669537876894 implements MigrationInterface {
  name = 'CreateMerchantLazada1669537876894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_lazada" ("id" SERIAL NOT NULL, "authCode" character varying, "accessToken" character varying, "accessTokenExpireIn" integer, "refreshToken" character varying, "refreshTokenExpireIn" integer, "shopId" character varying, "shopName" character varying, "region" character varying, "account_platform" character varying, "account" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_0bdaf8d3559193b380f6433c71" UNIQUE ("merchantId"), CONSTRAINT "PK_a54b20b8b3e1de804e34da44d14" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" ADD CONSTRAINT "FK_0bdaf8d3559193b380f6433c715" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_lazada" DROP CONSTRAINT "FK_0bdaf8d3559193b380f6433c715"`
    );
    await queryRunner.query(`DROP TABLE "merchant_lazada"`);
  }
}
