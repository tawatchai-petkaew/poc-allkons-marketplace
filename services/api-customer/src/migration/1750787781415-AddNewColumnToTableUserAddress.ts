import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNewColumnToTableUserAddress1750787781415 implements MigrationInterface {
    name = 'AddNewColumnToTableUserAddress1750787781415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_address_usedaddress_enum" AS ENUM('ID_CARD', 'CURRENT', 'TAX_INVOICE')`);
        await queryRunner.query(`ALTER TABLE "user_address" ADD "usedAddress" "public"."user_address_usedaddress_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_address" DROP COLUMN "usedAddress"`);
        await queryRunner.query(`DROP TYPE "public"."user_address_usedaddress_enum"`);
    }

}
