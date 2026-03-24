import {MigrationInterface, QueryRunner} from "typeorm";

export class EditMemberStatusEnum1756720068373 implements MigrationInterface {
    name = 'EditMemberStatusEnum1756720068373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_organization_memberstatus_enum" RENAME TO "user_organization_memberstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_organization_memberstatus_enum" AS ENUM('NONE', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WAIT_FOR_APPROVE')`);
        await queryRunner.query(`ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" TYPE "public"."user_organization_memberstatus_enum" USING "memberStatus"::"text"::"public"."user_organization_memberstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" SET DEFAULT 'NONE'`);
        await queryRunner.query(`DROP TYPE "public"."user_organization_memberstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {        
        await queryRunner.query(`CREATE TYPE "public"."user_organization_memberstatus_enum_old" AS ENUM('NONE', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" TYPE "public"."user_organization_memberstatus_enum_old" USING "memberStatus"::"text"::"public"."user_organization_memberstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_organization" ALTER COLUMN "memberStatus" SET DEFAULT 'NONE'`);
        await queryRunner.query(`DROP TYPE "public"."user_organization_memberstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_organization_memberstatus_enum_old" RENAME TO "user_organization_memberstatus_enum"`);
    }

}
