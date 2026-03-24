import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTableEvenLog1755601823710 implements MigrationInterface {
    name = 'CreateTableEvenLog1755601823710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "even_log" ("id" SERIAL NOT NULL, "url" character varying, "function" character varying, "data" text, "response" text, "organizeId" integer, "userId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_c386895fbaeeb24145a352c71d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d8a9be170ac8674e542c737d40" ON "even_log" ("organizeId", "userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "even_log"`);
    }

}
