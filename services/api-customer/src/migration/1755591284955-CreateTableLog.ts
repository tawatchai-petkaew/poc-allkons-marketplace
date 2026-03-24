import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTableLog1755591284955 implements MigrationInterface {
    name = 'CreateTableLog1755591284955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."draft_organize_kycstatus_enum" AS ENUM('NONE', 'WAIT_FOR_APPROVE', 'REQUEST_MORE', 'APPROVE', 'REJECT')`);
        await queryRunner.query(`ALTER TABLE "draft_organize" ADD "kycStatus" "public"."draft_organize_kycstatus_enum" DEFAULT 'NONE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_organize" DROP COLUMN "kycStatus"`);
    }

}
