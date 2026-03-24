import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToCart1757483239237 implements MigrationInterface {
    name = 'AddColumnToCart1757483239237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "cart" ADD "organizationId" integer`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_ea878145fbe844520a4cb56d74e" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_ea878145fbe844520a4cb56d74e"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_756f53ab9466eb52a52619ee019"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "userId"`);
    }

}
