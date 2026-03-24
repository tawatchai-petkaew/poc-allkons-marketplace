import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserCustomerAddressTable1754018385261
  implements MigrationInterface
{
  name = 'CreateUserCustomerAddressTable1754018385261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."project_status_enum" AS ENUM('active', 'inActive', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "userId" integer NOT NULL, "organizeId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "status" "public"."project_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_customer_address_addresstype_enum" AS ENUM('SHIPPING_ADDRESS', 'WORK_SITE_ADDRESS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_customer_address_status_enum" AS ENUM('active', 'inActive', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_customer_address" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "organizeId" integer NOT NULL, "addressType" "public"."user_customer_address_addresstype_enum" NOT NULL, "contactName" character varying(255) NOT NULL, "contactPhoneNumber" character varying(10) NOT NULL, "countryId" integer NOT NULL, "provinceId" integer NOT NULL, "districtId" integer NOT NULL, "subDistrictId" integer NOT NULL, "zipcodeId" integer NOT NULL, "countryName" character varying(255) NOT NULL, "provinceName" character varying(255) NOT NULL, "districtName" character varying(255) NOT NULL, "subDistrictName" character varying(255) NOT NULL, "zipcodeName" character varying(20) NOT NULL, "projectId" integer, "addressName" character varying(255) NOT NULL, "addressInfo" text NOT NULL, "remark" text, "latitude" character varying(50), "longitude" character varying(50), "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "status" "public"."user_customer_address_status_enum" NOT NULL DEFAULT 'active', "cisNumber" character varying, CONSTRAINT "PK_1914f9336ad8f0ad27eb5dc9446" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_82d5fc0eee5c7b727230ba4c88a" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_8a903254bda46d55f8ec799d86c" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_9d56ab6bc667c7c08bbc084d9e1" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_ad1dca372d4bf684503e69a08d3" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_178775430405c7cc837229c1762" FOREIGN KEY ("zipcodeId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_c842e4d32da130fd75a3ccf5c9b" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_e1cd1d79df451a3c90d28a6b939" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_e27f39d24e31acfd86d328e12f5" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_e27f39d24e31acfd86d328e12f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_e1cd1d79df451a3c90d28a6b939"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_c842e4d32da130fd75a3ccf5c9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_178775430405c7cc837229c1762"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_ad1dca372d4bf684503e69a08d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_9d56ab6bc667c7c08bbc084d9e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_8a903254bda46d55f8ec799d86c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_82d5fc0eee5c7b727230ba4c88a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63"`,
    );
    await queryRunner.query(`DROP TABLE "user_customer_address"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_customer_address_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_customer_address_addresstype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
  }
}
