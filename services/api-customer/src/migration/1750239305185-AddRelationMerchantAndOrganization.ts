import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRelationMerchantAndOrganization1750239305185 implements MigrationInterface {
    name = 'AddRelationMerchantAndOrganization1750239305185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "taxId"`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "organizeId" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "merchant"."organizeId" IS 'Organization ID that this merchant belongs to'`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD CONSTRAINT "FK_b6cc6ff8ad16aeffafa69421c9f" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP CONSTRAINT "FK_b6cc6ff8ad16aeffafa69421c9f"`);
        await queryRunner.query(`COMMENT ON COLUMN "merchant"."organizeId" IS 'Organization ID that this merchant belongs to'`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "organizeId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "taxId" character varying`);
    }

}
