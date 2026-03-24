import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameTableEvenLogToEventLog1755672436635 implements MigrationInterface {
    name = 'RenameTableEvenLogToEventLog1755672436635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event_log" ("id" SERIAL NOT NULL, "url" character varying, "function" character varying, "data" text, "response" text, "organizeId" integer, "userId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_d8ccd9b5b44828ea378dd37e691" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_22bc815471de4b8579e476823e" ON "event_log" ("organizeId", "userId") `);
        await queryRunner.query(`DROP TABLE "even_log"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "event_log"`);
    }

}
