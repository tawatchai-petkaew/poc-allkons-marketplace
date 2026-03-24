import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexToInvationAndLeaveLogTable1762508676194 implements MigrationInterface {
    name = 'AddIndexToInvationAndLeaveLogTable1762508676194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_org_leave_log_user" ON "organization_leave_log" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_org_leave_log_role" ON "organization_leave_log" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "idx_org_leave_log_org" ON "organization_leave_log" ("organizationId") `);
        await queryRunner.query(`CREATE INDEX "idx_org_leave_log_user_org" ON "organization_leave_log" ("userId", "organizationId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_org_leave_log_user_org"`);
        await queryRunner.query(`DROP INDEX "public"."idx_org_leave_log_org"`);
        await queryRunner.query(`DROP INDEX "public"."idx_org_leave_log_role"`);
        await queryRunner.query(`DROP INDEX "public"."idx_org_leave_log_user"`);
    }

}
