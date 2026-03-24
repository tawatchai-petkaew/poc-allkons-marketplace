import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToRoleAndPermissionTable1755677558525 implements MigrationInterface {
    name = 'AddColumnToRoleAndPermissionTable1755677558525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('ORGANIZATION', 'USER', 'MERCHANT', 'PRODUCT', 'SHOP', 'ORDER', 'MEMBER', 'CREDIT', 'PROMOTION')`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "resource" "public"."permissions_resource_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE', 'VIEW')`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "action" "public"."permissions_action_enum"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "organizeId" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."organizeId" IS 'Organization ID that this role belongs to'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "roles"."organizeId" IS 'Organization ID that this role belongs to'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "organizeId"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "action"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "resource"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
    }

}
