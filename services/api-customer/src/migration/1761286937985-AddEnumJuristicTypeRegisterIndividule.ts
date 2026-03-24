import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEnumJuristicTypeRegisterIndividule1761286937985 implements MigrationInterface {
    name = 'AddEnumJuristicTypeRegisterIndividule1761286937985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."juristic_type_value_enum" RENAME TO "juristic_type_value_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."juristic_type_value_enum" AS ENUM('PERSONAL', 'PUBLIC_LIMITED_COMPANY', 'LIMITED_COMPANY', 'LIMITED_PARTNERSHIP', 'GENERAL_PARTNERSHIP', 'OTHER', 'REGISTERED_INDIVIDUAL')`);
        await queryRunner.query(`ALTER TABLE "juristic_type" ALTER COLUMN "value" TYPE "public"."juristic_type_value_enum" USING "value"::"text"::"public"."juristic_type_value_enum"`);
        await queryRunner.query(`DROP TYPE "public"."juristic_type_value_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."juristic_type_value_enum_old" AS ENUM('GENERAL_PARTNERSHIP', 'LIMITED_COMPANY', 'LIMITED_PARTNERSHIP', 'OTHER', 'PERSONAL', 'PUBLIC_LIMITED_COMPANY')`);
        await queryRunner.query(`ALTER TABLE "juristic_type" ALTER COLUMN "value" TYPE "public"."juristic_type_value_enum_old" USING "value"::"text"::"public"."juristic_type_value_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."juristic_type_value_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."juristic_type_value_enum_old" RENAME TO "juristic_type_value_enum"`);
    }

}
