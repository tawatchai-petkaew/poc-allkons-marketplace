import {MigrationInterface, QueryRunner} from "typeorm";

export class AddContactOnProduct1695271546500 implements MigrationInterface {
    name = 'AddContactOnProduct1695271546500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "isContactOnly" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "product" ADD "telContact" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "emailContact" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "lineContact" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "facebookContact" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "instagramContact" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "urlGoogleMap" character varying`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "urlGoogleMap" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "urlGoogleMap"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "urlGoogleMap"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "instagramContact"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "facebookContact"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "lineContact"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "emailContact"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "telContact"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isContactOnly"`);
    }

}
