import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDraftUserAndDraftUserAddressTable1760107995821
  implements MigrationInterface
{
  name = 'AddDraftUserAndDraftUserAddressTable1760107995821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."draft_user_gender_enum" AS ENUM('male', 'female', 'notSpecified')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_user_maritalstatus_enum" AS ENUM('CELIBATE', 'MARRIED', 'DIVORCED', 'WIDOWED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_user_businesstype_enum" AS ENUM('AGENT', 'BIXBOX', 'MDT', 'ONL', 'FAC', 'CON', 'CH', 'DVP', 'DVP_HOTEL', 'DVP_CONNDO', 'DVP_APT', 'DVP_DOR', 'DVP_SC', 'DVP_GASSTATION', 'DVP_AHD', 'ARC', 'ARC_LND_ARC', 'ARC_ARC', 'ARC_ID', 'ARC_PD', 'ENG', 'ENG_CE', 'ENG_ENV', 'ENG_ME', 'ENG_EC', 'IGFA', 'IGFA_CN', 'IGFA_ID', 'IGFA_VN', 'IGFA_OTHER', 'BANK', 'NONE_BANK', 'GIL', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_user_kycstatus_enum" AS ENUM('NONE', 'WAIT_FOR_APPROVE', 'REQUEST_MORE', 'APPROVE', 'REJECT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "draft_user" ("id" SERIAL NOT NULL, "image" character varying, "countryCode" character varying, "tel" character varying, "email" character varying, "firstNameTh" character varying, "middleNameTh" character varying, "lastNameTh" character varying, "firstNameEn" character varying, "middleNameEn" character varying, "lastNameEn" character varying, "gender" "public"."draft_user_gender_enum", "maritalStatus" "public"."draft_user_maritalstatus_enum", "birthDate" TIMESTAMP, "idCard" character varying, "businessType" "public"."draft_user_businesstype_enum" array DEFAULT '{}', "kycStatus" "public"."draft_user_kycstatus_enum" DEFAULT 'NONE', "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_3789a6a5307b5b6fbcc1afb715" UNIQUE ("userId"), CONSTRAINT "PK_a1cce29d61926c2b2916f4af148" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_user_address_addresstype_enum" AS ENUM('ID_CARD', 'CURRENT', 'TAX_INVOICE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_user_address_issameaddress_enum" AS ENUM('ID_CARD', 'CURRENT', 'TAX_INVOICE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "draft_user_address" ("id" SERIAL NOT NULL, "addressType" "public"."draft_user_address_addresstype_enum" NOT NULL, "address" character varying NOT NULL, "countryId" integer, "provinceId" integer, "districtId" integer, "subDistrictId" integer, "isSameAddress" "public"."draft_user_address_issameaddress_enum", "draftUserId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e970ca7ee49bc445c1385c0adec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user" ADD CONSTRAINT "FK_3789a6a5307b5b6fbcc1afb7152" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ADD CONSTRAINT "FK_6135632c0aaa37620fe159a34e5" FOREIGN KEY ("draftUserId") REFERENCES "draft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ADD CONSTRAINT "FK_84084d73d9fcd4b2960f711d942" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ADD CONSTRAINT "FK_d3e5a9b0c0b94a5d6818c14b8bc" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ADD CONSTRAINT "FK_897cb307416b54d15951f1c2f93" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ADD CONSTRAINT "FK_e87583ba12b4048ca55d1de0770" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" DROP CONSTRAINT "FK_e87583ba12b4048ca55d1de0770"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" DROP CONSTRAINT "FK_897cb307416b54d15951f1c2f93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" DROP CONSTRAINT "FK_d3e5a9b0c0b94a5d6818c14b8bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" DROP CONSTRAINT "FK_84084d73d9fcd4b2960f711d942"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" DROP CONSTRAINT "FK_6135632c0aaa37620fe159a34e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_user" DROP CONSTRAINT "FK_3789a6a5307b5b6fbcc1afb7152"`,
    );
    await queryRunner.query(`DROP TABLE "draft_user_address"`);
    await queryRunner.query(
      `DROP TYPE "public"."draft_user_address_issameaddress_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."draft_user_address_addresstype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "draft_user"`);
    await queryRunner.query(`DROP TYPE "public"."draft_user_kycstatus_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."draft_user_businesstype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."draft_user_maritalstatus_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."draft_user_gender_enum"`);
  }
}
