import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerTable1627225131676 implements MigrationInterface {
  name = 'CreateCustomerTable1627225131676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "customer" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "countryCode" character varying NOT NULL, "tel" character varying NOT NULL, "email" character varying, "tag" text array, "notation" text, "status" "customer_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, "merchantId" integer, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "customer_address" ("id" SERIAL NOT NULL, "fullName" character varying, "tel" character varying, "email" character varying, "address" character varying, "postCodeAddress" character varying, "provinceAddress" character varying, "districtAddress" character varying, "subdistrictAddress" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, CONSTRAINT "PK_23810fb397050d8ac37dae44ff6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "FK_3f62b42ed23958b120c235f74df" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "FK_23778827c741b8937b565a59293" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_address" ADD CONSTRAINT "FK_af004ad3c5bf7e3096f5d40190f" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_address" DROP CONSTRAINT "FK_af004ad3c5bf7e3096f5d40190f"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP CONSTRAINT "FK_23778827c741b8937b565a59293"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP CONSTRAINT "FK_3f62b42ed23958b120c235f74df"`
    );
    await queryRunner.query(`DROP TABLE "customer_address"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TYPE "customer_status_enum"`);
  }
}
