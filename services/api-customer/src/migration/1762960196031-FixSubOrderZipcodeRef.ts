import {MigrationInterface, QueryRunner} from "typeorm";

export class FixSubOrderZipcodeRef1762960196031 implements MigrationInterface {
    name = 'FixSubOrderZipcodeRef1762960196031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_ed95fa3b5c743db398472ea31b9"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP COLUMN "zipcodeId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_order" ADD "zipcodeId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_ed95fa3b5c743db398472ea31b9" FOREIGN KEY ("zipcodeId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
