import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUserAddress1750409378289 implements MigrationInterface {
  name = 'CreateTableUserAddress1750409378289';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_address_addresstype_enum" AS ENUM('ID_CARD', 'CURRENT', 'TAX_INVOICE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_address" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "addressType" "public"."user_address_addresstype_enum", "address" character varying NOT NULL, "countryId" integer, "provinceId" integer, "districtId" integer, "subDistrictId" integer, "cisNumber" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_302d96673413455481d5ff4022a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "firstNameTh" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastNameTh" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "middleNameTh" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "firstNameEn" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastNameEn" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "middleNameEn" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_maritalstatus_enum" AS ENUM('CELIBATE', 'MARRIED', 'DIVORCED', 'WIDOWED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "maritalStatus" "public"."user_maritalstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD CONSTRAINT "FK_c82c2faa0ad2b5a847cc01887e4" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD CONSTRAINT "FK_c038161be1ee4d3305243da9566" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD CONSTRAINT "FK_ee33dd3bf0b594748ff35497677" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD CONSTRAINT "FK_dd7a822416365366b4e07e64283" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP CONSTRAINT "FK_dd7a822416365366b4e07e64283"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP CONSTRAINT "FK_ee33dd3bf0b594748ff35497677"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP CONSTRAINT "FK_c038161be1ee4d3305243da9566"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP CONSTRAINT "FK_c82c2faa0ad2b5a847cc01887e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "maritalStatus"`);
    await queryRunner.query(`DROP TYPE "public"."user_maritalstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "middleNameEn"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastNameEn"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstNameEn"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "middleNameTh"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastNameTh"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstNameTh"`);
    await queryRunner.query(`DROP TABLE "user_address"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_address_addresstype_enum"`,
    );
  }
}
