import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexProductCategoryOrder1762510403152 implements MigrationInterface {
    name = 'AddIndexProductCategoryOrder1762510403152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_product_category_order" ON "product_category" ("order") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_product_category_order"`);
    }

}
