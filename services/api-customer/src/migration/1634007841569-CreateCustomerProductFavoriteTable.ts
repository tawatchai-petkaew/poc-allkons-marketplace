import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerProductFavoriteTable1634007841569
  implements MigrationInterface {
  name = 'CreateCustomerProductFavoriteTable1634007841569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_product_favorite_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "customer_product_favorite" ("id" SERIAL NOT NULL, "status" "customer_product_favorite_status_enum" NOT NULL DEFAULT 'inActive', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, "productId" integer, CONSTRAINT "PK_2edff8be28563e564bb35142090" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_product_favorite" ADD CONSTRAINT "FK_8965f87e248cd488f61cbd0f4f0" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_product_favorite" ADD CONSTRAINT "FK_185cf0cddec6781424d071e5c26" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_product_favorite" DROP CONSTRAINT "FK_185cf0cddec6781424d071e5c26"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_product_favorite" DROP CONSTRAINT "FK_8965f87e248cd488f61cbd0f4f0"`
    );
    await queryRunner.query(`DROP TABLE "customer_product_favorite"`);
    await queryRunner.query(
      `DROP TYPE "customer_product_favorite_status_enum"`
    );
  }
}
