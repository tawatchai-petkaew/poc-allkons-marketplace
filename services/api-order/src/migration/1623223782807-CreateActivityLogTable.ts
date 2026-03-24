import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityLogTable1623223782807 implements MigrationInterface {
  name = 'CreateActivityLogTable1623223782807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity_log" ("id" SERIAL NOT NULL, "resourceType" character varying NOT NULL, "resourceId" integer NOT NULL, "actionType" character varying NOT NULL, "actionId" integer NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activity_log"`);
  }
}
