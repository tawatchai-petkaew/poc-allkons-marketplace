import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeyTable1688279249280 implements MigrationInterface {
  name = 'CreateApiKeyTable1688279249280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api_key" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_bc1c10fdbde586903a7c1bbc1d" UNIQUE ("merchantId"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_bc1c10fdbde586903a7c1bbc1d0" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_bc1c10fdbde586903a7c1bbc1d0"`,
    );
    await queryRunner.query(`DROP TABLE "api_key"`);
  }
}
