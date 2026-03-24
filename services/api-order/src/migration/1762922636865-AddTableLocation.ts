import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableLocation1762922636865 implements MigrationInterface {
  name = 'AddTableLocation1762922636865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "location" ("id" SERIAL NOT NULL, "userId" integer, "countryId" integer NOT NULL, "provinceId" integer NOT NULL, "districtId" integer NOT NULL, "subDistrictId" integer NOT NULL, "countryName" character varying(255) NOT NULL, "provinceName" character varying(255) NOT NULL, "districtName" character varying(255) NOT NULL, "subDistrictName" character varying(255) NOT NULL, "zipcodeName" character varying(20) NOT NULL, "addressName" character varying(255) NOT NULL, "latitude" character varying(50), "longitude" character varying(50), "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_location_is_default" ON "location" ("isDefault") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_location_user_id" ON "location" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_2a0d327b57744963f0733b4db76" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_7d7df9887609d88d47be93f17e7" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_9168f51e3725c996ea0a84d0a55" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_9168f51e3725c996ea0a84d0a55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_7d7df9887609d88d47be93f17e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_2a0d327b57744963f0733b4db76"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_location_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_location_is_default"`);
    await queryRunner.query(`DROP TABLE "location"`);
  }
}
