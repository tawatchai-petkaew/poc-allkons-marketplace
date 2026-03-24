import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePackageProductTable1625731740946
  implements MigrationInterface
{
  name = 'CreatePackageProductTable1625731740946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "package_product" ("id" SERIAL NOT NULL, "quality" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "packageId" integer, "productId" integer, CONSTRAINT "PK_85b3da53042d974761ca9a8cb09" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "package" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer, "merchantId" integer, CONSTRAINT "REL_7f9162b8a4110790bc15d04ca5" UNIQUE ("productId"), CONSTRAINT "PK_308364c66df656295bc4ec467c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "isPackage" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_product" ADD CONSTRAINT "FK_c11b9ecd0ecc302a9fa5d33d4c4" FOREIGN KEY ("packageId") REFERENCES "package"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_product" ADD CONSTRAINT "FK_deb4338f288208a02c4f3ce1fe6" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "package" ADD CONSTRAINT "FK_7f9162b8a4110790bc15d04ca5f" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "package" ADD CONSTRAINT "FK_e3a4665fcca2012364539bef4fb" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package" DROP CONSTRAINT "FK_e3a4665fcca2012364539bef4fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package" DROP CONSTRAINT "FK_7f9162b8a4110790bc15d04ca5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_product" DROP CONSTRAINT "FK_deb4338f288208a02c4f3ce1fe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_product" DROP CONSTRAINT "FK_c11b9ecd0ecc302a9fa5d33d4c4"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isPackage"`);
    await queryRunner.query(`DROP TABLE "package"`);
    await queryRunner.query(`DROP TABLE "package_product"`);
  }
}
