import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeOrderitemRelationWithVoucher1701842657637 implements MigrationInterface {
    name = 'ChangeOrderitemRelationWithVoucher1701842657637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "FK_8011a27b9309aa602790eaf2ed1"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "REL_8011a27b9309aa602790eaf2ed"`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "FK_8011a27b9309aa602790eaf2ed1" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "FK_8011a27b9309aa602790eaf2ed1"`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "REL_8011a27b9309aa602790eaf2ed" UNIQUE ("orderItemId")`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "FK_8011a27b9309aa602790eaf2ed1" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
