import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteEnumBannerTable1639627852778 implements MigrationInterface {
  name = 'DeleteEnumBannerTable1639627852778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP COLUMN "type"`
    );
    await queryRunner.query(`DROP TYPE "public"."banner_promotion_type_enum"`);
    await queryRunner.query(`ALTER TABLE "banner_merchant" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."banner_merchant_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."banner_merchant_type_enum" AS ENUM('nonLink', 'blog', 'product', 'productCategory', 'productBrand', 'url')`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD "type" "banner_merchant_type_enum" NOT NULL`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."banner_promotion_type_enum" AS ENUM('nonLink', 'blog', 'product', 'productCategory', 'productBrand', 'url')`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD "type" "banner_promotion_type_enum" NOT NULL`
    );
  }
}
