import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEnumToGenderUser1750746017483 implements MigrationInterface {
    name = 'AddEnumToGenderUser1750746017483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."customer_gender_enum" RENAME TO "customer_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."customer_gender_enum" AS ENUM('male', 'female', 'notSpecified')`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "gender" TYPE "public"."customer_gender_enum" USING "gender"::"text"::"public"."customer_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customer_gender_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."user_gender_enum" RENAME TO "user_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('male', 'female', 'notSpecified')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "gender" TYPE "public"."user_gender_enum" USING "gender"::"text"::"public"."user_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum_old" AS ENUM('female', 'male')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "gender" TYPE "public"."user_gender_enum_old" USING "gender"::"text"::"public"."user_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_gender_enum_old" RENAME TO "user_gender_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."customer_gender_enum_old" AS ENUM('female', 'male')`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "gender" TYPE "public"."customer_gender_enum_old" USING "gender"::"text"::"public"."customer_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."customer_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."customer_gender_enum_old" RENAME TO "customer_gender_enum"`);
    }

}
