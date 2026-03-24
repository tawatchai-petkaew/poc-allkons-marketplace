import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatePhoneWhiteListTable1756830848748 implements MigrationInterface {
    name = 'CreatePhoneWhiteListTable1756830848748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "phone_white_list" ("id" SERIAL NOT NULL, "organizationId" integer NOT NULL, "phoneNumber" character varying(20) NOT NULL, "countryCode" character varying(10), "label" character varying(100), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_phone_country_combination" UNIQUE ("phoneNumber", "countryCode"), CONSTRAINT "PK_9f6fbfe03fed4989088f8eae1f6" PRIMARY KEY ("id")); COMMENT ON COLUMN "phone_white_list"."organizationId" IS 'Organization ID'; COMMENT ON COLUMN "phone_white_list"."phoneNumber" IS 'Phone number'; COMMENT ON COLUMN "phone_white_list"."countryCode" IS 'Country code (e.g., +66)'; COMMENT ON COLUMN "phone_white_list"."label" IS 'Label or description for this phone number'; COMMENT ON COLUMN "phone_white_list"."isActive" IS 'Whether this phone number is active'`);
        await queryRunner.query(`CREATE INDEX "IDX_phone_white_list_organization_id" ON "phone_white_list" ("organizationId") `);
        await queryRunner.query(`ALTER TABLE "phone_white_list" ADD CONSTRAINT "FK_e4bc32e107a4590888db18d7284" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "phone_white_list" DROP CONSTRAINT "FK_e4bc32e107a4590888db18d7284"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_phone_white_list_organization_id"`);
        await queryRunner.query(`DROP TABLE "phone_white_list"`);
    }

}
