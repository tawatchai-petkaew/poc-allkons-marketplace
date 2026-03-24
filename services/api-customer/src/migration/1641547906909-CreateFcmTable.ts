import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFcmTable1641547906909 implements MigrationInterface {
  name = 'CreateFcmTable1641547906909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_firebase_cloud_messaging" ("id" SERIAL NOT NULL, "serverKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "REL_01161a64316b203b8ab627d084" UNIQUE ("merchantId"), CONSTRAINT "PK_0e664cf993a7780f785ba4d07d0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_firebase_cloud_messaging" ADD CONSTRAINT "FK_01161a64316b203b8ab627d084d" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_firebase_cloud_messaging" DROP CONSTRAINT "FK_01161a64316b203b8ab627d084d"`
    );
    await queryRunner.query(`DROP TABLE "merchant_firebase_cloud_messaging"`);
  }
}
