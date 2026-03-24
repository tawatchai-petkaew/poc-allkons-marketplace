import {MigrationInterface, QueryRunner} from "typeorm";

export class MigrateEnum1755579250404 implements MigrationInterface {
    name = 'MigrateEnum1755579250404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."draft_organize_organizationtype_enum" RENAME TO "draft_organize_organizationtype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."draft_organize_organizationtype_enum" AS ENUM('PERSONAL', 'JURISTIC', 'REGISTERED_INDIVIDUAL')`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ALTER COLUMN "organizationType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ALTER COLUMN "organizationType" TYPE "public"."draft_organize_organizationtype_enum" USING "organizationType"::"text"::"public"."draft_organize_organizationtype_enum"`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ALTER COLUMN "organizationType" SET DEFAULT 'PERSONAL'`);
        await queryRunner.query(`DROP TYPE "public"."draft_organize_organizationtype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."draft_organize_organizationtype_enum_old" AS ENUM('JURISTIC', 'PERSONAL', 'REGISTER_INDIVIDUAL')`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ALTER COLUMN "organizationType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ALTER COLUMN "organizationType" TYPE "public"."draft_organize_organizationtype_enum_old" USING "organizationType"::"text"::"public"."draft_organize_organizationtype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ALTER COLUMN "organizationType" SET DEFAULT 'PERSONAL'`);
        await queryRunner.query(`DROP TYPE "public"."draft_organize_organizationtype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."draft_organize_organizationtype_enum_old" RENAME TO "draft_organize_organizationtype_enum"`);
    }

}
