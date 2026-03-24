import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocationStructureTable1623730356833
  implements MigrationInterface {
  name = 'CreateLocationStructureTable1623730356833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sub_district" ("id" SERIAL NOT NULL, "name_th" character varying NOT NULL, "name_en" character varying NOT NULL, "zip_code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "districtId" integer, CONSTRAINT "PK_3feea0f1a7cdea813373a32e653" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "district" ("id" SERIAL NOT NULL, "name_th" character varying NOT NULL, "name_en" character varying NOT NULL, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "provinceId" integer, CONSTRAINT "PK_ee5cb6fd5223164bb87ea693f1e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "province" ("id" SERIAL NOT NULL, "name_th" character varying NOT NULL, "name_en" character varying NOT NULL, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "countryId" integer, CONSTRAINT "PK_4f461cb46f57e806516b7073659" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "sub_district" ADD CONSTRAINT "FK_8af6e624022d3c72f61e2cff631" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "district" ADD CONSTRAINT "FK_23a21b38208367a242b1dd3a424" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "province" ADD CONSTRAINT "FK_493e19852e51a27ff8e544fd8cc" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "province" DROP CONSTRAINT "FK_493e19852e51a27ff8e544fd8cc"`
    );
    await queryRunner.query(
      `ALTER TABLE "district" DROP CONSTRAINT "FK_23a21b38208367a242b1dd3a424"`
    );
    await queryRunner.query(
      `ALTER TABLE "sub_district" DROP CONSTRAINT "FK_8af6e624022d3c72f61e2cff631"`
    );
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TABLE "province"`);
    await queryRunner.query(`DROP TABLE "district"`);
    await queryRunner.query(`DROP TABLE "sub_district"`);
  }
}
