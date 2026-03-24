import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnumBanner1660251158207 implements MigrationInterface {
  name = 'UpdateEnumBanner1660251158207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "banner_promotion_type_enum" RENAME TO "banner_promotion_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "banner_promotion_type_enum" AS ENUM('nonLink', 'article', 'product', 'productCategory', 'productBrand', 'productCatalog', 'url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ALTER COLUMN "type" TYPE "banner_promotion_type_enum" USING "type"::"text"::"banner_promotion_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "banner_promotion_type_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "banner_merchant_type_enum" RENAME TO "banner_merchant_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "banner_merchant_type_enum" AS ENUM('nonLink', 'article', 'product', 'productCategory', 'productBrand', 'productCatalog', 'url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ALTER COLUMN "type" TYPE "banner_merchant_type_enum" USING "type"::"text"::"banner_merchant_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "banner_merchant_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "banner_merchant_type_enum_old" AS ENUM('nonLink', 'article', 'product', 'productCategory', 'productBrand', 'url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ALTER COLUMN "type" TYPE "banner_merchant_type_enum_old" USING "type"::"text"::"banner_merchant_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "banner_merchant_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "banner_merchant_type_enum_old" RENAME TO "banner_merchant_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "banner_promotion_type_enum_old" AS ENUM('nonLink', 'article', 'product', 'productCategory', 'productBrand', 'url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ALTER COLUMN "type" TYPE "banner_promotion_type_enum_old" USING "type"::"text"::"banner_promotion_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "banner_promotion_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "banner_promotion_type_enum_old" RENAME TO "banner_promotion_type_enum"`,
    );
  }
}
