import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUpdateKeyWidgetTable1699321874304 implements MigrationInterface {
    name = 'AddUpdateKeyWidgetTable1699321874304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "widget" DROP CONSTRAINT "UQ_9e9a8507454ffcb96b4e22455df"`);
        await queryRunner.query(`ALTER TABLE "theme" DROP CONSTRAINT "UQ_7b0e03a94450de6bb2114896b24"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "theme" ADD CONSTRAINT "UQ_7b0e03a94450de6bb2114896b24" UNIQUE ("key")`);
        await queryRunner.query(`ALTER TABLE "widget" ADD CONSTRAINT "UQ_9e9a8507454ffcb96b4e22455df" UNIQUE ("key")`);
    }

}
