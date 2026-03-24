import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsEnableGoogleAiToMerchant1706521731455 implements MigrationInterface {
    name = 'AddIsEnableGoogleAiToMerchant1706521731455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" ADD "isEnableGoogleAi" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "isEnableGoogleAi"`);
    }

}
