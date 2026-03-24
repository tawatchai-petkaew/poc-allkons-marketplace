import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnGroupAndDescriptionToPermissionTable1757513082596 implements MigrationInterface {
    name = 'AddColumnGroupAndDescriptionToPermissionTable1757513082596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" ADD "descriptionTh" character varying(100)`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."descriptionTh" IS 'description in Thai'`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_group_enum" AS ENUM('ORGANIZATION_INFO', 'USER_ORGANIZATION', 'ROLE_PERMISSION', 'ORGANIZATION_PHONE', 'PAYMENT', 'BANK_ACCOUNT_INFO', 'MERCHANT', 'PROMOTION')`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "group" "public"."permissions_group_enum"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "groupNameTh" character varying(100)`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."groupNameTh" IS 'group name in Thai'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."groupNameTh" IS 'group name in Thai'`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "groupNameTh"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "group"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_group_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."descriptionTh" IS 'description in Thai'`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "descriptionTh"`);
    }

}
