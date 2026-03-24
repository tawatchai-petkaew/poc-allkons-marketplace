import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrgLeaveLogTable1758008823670 implements MigrationInterface {
  name = 'CreateOrgLeaveLogTable1758008823670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_leave_log_leavestatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_leave_log" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "organizationId" integer NOT NULL, "roleId" integer NOT NULL, "leaveStatus" "public"."organization_leave_log_leavestatus_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d7b774db506954d6f933b733953" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_leave_log" ADD CONSTRAINT "FK_086e2fbb419e2a2ffc7b7d8287c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_leave_log" ADD CONSTRAINT "FK_f6dc80d4ef3f538dbebb9381905" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_leave_log" ADD CONSTRAINT "FK_01099ab469c989019d98549a151" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_leave_log" DROP CONSTRAINT "FK_01099ab469c989019d98549a151"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_leave_log" DROP CONSTRAINT "FK_f6dc80d4ef3f538dbebb9381905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_leave_log" DROP CONSTRAINT "FK_086e2fbb419e2a2ffc7b7d8287c"`,
    );
    await queryRunner.query(`DROP TABLE "organization_leave_log"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_leave_log_leavestatus_enum"`,
    );
  }
}
