import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCoumnRoleIdToUserMerchant1759247358965 implements MigrationInterface {
    name = 'AddCoumnRoleIdToUserMerchant1759247358965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_merchants_merchant" ADD "roleId" integer`);
        await queryRunner.query(`ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_656d4963813e8f6eb4960e99f84" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_656d4963813e8f6eb4960e99f84"`);
        await queryRunner.query(`ALTER TABLE "user_merchants_merchant" DROP COLUMN "roleId"`);
    }

}
