import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateJuristicTypeTable1753115642764 implements MigrationInterface {
    name = 'CreateJuristicTypeTable1753115642764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."juristic_type_value_enum" AS ENUM('PERSONAL', 'PUBLIC_LIMITED_COMPANY', 'LIMITED_COMPANY', 'LIMITED_PARTNERSHIP', 'GENERAL_PARTNERSHIP', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."juristic_type_language_enum" AS ENUM('th', 'en')`);
        await queryRunner.query(`CREATE TABLE "juristic_type" ("id" SERIAL NOT NULL, "label" character varying NOT NULL, "value" "public"."juristic_type_value_enum" NOT NULL, "prefix" character varying, "subfix" character varying, "language" "public"."juristic_type_language_enum" NOT NULL DEFAULT 'th', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2cd92e25f6bdd2de3c2f7055fc0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "juristicTypeId" integer`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_3a2a80eaf75826d2cdd6d0240e4" FOREIGN KEY ("juristicTypeId") REFERENCES "juristic_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_3a2a80eaf75826d2cdd6d0240e4"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "juristicTypeId"`);
        await queryRunner.query(`DROP TABLE "juristic_type"`);
        await queryRunner.query(`DROP TYPE "public"."juristic_type_language_enum"`);
        await queryRunner.query(`DROP TYPE "public"."juristic_type_value_enum"`);
    }

}
