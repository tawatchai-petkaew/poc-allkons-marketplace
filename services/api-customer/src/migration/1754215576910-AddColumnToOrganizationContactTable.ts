import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToOrganizationContactTable1754215576910 implements MigrationInterface {
    name = 'AddColumnToOrganizationContactTable1754215576910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_contact" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "organization_contact" ADD CONSTRAINT "FK_69dca14a19ae926b43afdeee6e6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_contact" DROP CONSTRAINT "FK_69dca14a19ae926b43afdeee6e6"`);
        await queryRunner.query(`ALTER TABLE "organization_contact" DROP COLUMN "userId"`);
    }

}
