import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCronJobShopees1701116244891 implements MigrationInterface {
    name = 'CreateCronJobShopees1701116244891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cron_job_shopee" ("id" character varying NOT NULL, "name" character varying NOT NULL, "partner_id" character varying NOT NULL, "status" character varying, "error_log" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a1c6fcb8a4f4238013c2164625a" UNIQUE ("id"), CONSTRAINT "PK_a1c6fcb8a4f4238013c2164625a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant_shopee" ADD "refresh_token_job_status" character varying`);
    }

}
