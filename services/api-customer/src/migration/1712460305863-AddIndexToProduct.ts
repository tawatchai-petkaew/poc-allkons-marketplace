import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexToProduct1712460305863 implements MigrationInterface {
    name = 'AddIndexToProduct1712460305863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "merchant_application_configur_id_seq" OWNED BY "merchant_application_configuration_extra_large_ios_screenshot"."id"`);
        await queryRunner.query(`ALTER TABLE "merchant_application_configuration_extra_large_ios_screenshot" ALTER COLUMN "id" SET DEFAULT nextval('"merchant_application_configur_id_seq"')`);
        await queryRunner.query(`CREATE INDEX "IDX_8cfaf4a1e80806d58e3dbe6922" ON "product" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_62fcc319202f6ec1f6819e1d5f" ON "product" ("merchantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2abbb9df7a83bdc561cb1e6111" ON "product" ("slug", "merchantId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2abbb9df7a83bdc561cb1e6111"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62fcc319202f6ec1f6819e1d5f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8cfaf4a1e80806d58e3dbe6922"`);
        await queryRunner.query(`ALTER TABLE "merchant_application_configuration_extra_large_ios_screenshot" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "merchant_application_configur_id_seq"`);
    }

}
