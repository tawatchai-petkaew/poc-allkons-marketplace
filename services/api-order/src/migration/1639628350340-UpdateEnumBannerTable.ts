import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnumBannerTable1639628350340 implements MigrationInterface {
  name = 'UpdateEnumBannerTable1639628350340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "banner_promotion_type_enum" AS ENUM('nonLink', 'article', 'product', 'productCategory', 'productBrand', 'url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD "type" "banner_promotion_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "banner_merchant_type_enum" AS ENUM('nonLink', 'article', 'product', 'productCategory', 'productBrand', 'url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD "type" "banner_merchant_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "banner_merchant" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "banner_merchant_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "banner_promotion_type_enum"`);
  }
}
