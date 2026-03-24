import {MigrationInterface, QueryRunner} from "typeorm";

export class JoinUserOrgToCart1756366884951 implements MigrationInterface {
    name = 'JoinUserOrgToCart1756366884951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart" ADD "userOrganizationId" integer`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_06ac5fbc34c9a601ad89eae19b3" FOREIGN KEY ("userOrganizationId") REFERENCES "user_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_06ac5fbc34c9a601ad89eae19b3"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "userOrganizationId"`);
    }

}
