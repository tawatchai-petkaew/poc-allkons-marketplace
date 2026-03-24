import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCountryCodeInvitationTable1759217644408 implements MigrationInterface {
    name = 'AddCountryCodeInvitationTable1759217644408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" ADD "countryCode" character varying(10) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "countryCode"`);
    }

}
