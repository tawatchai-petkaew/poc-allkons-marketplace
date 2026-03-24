import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganization1749808158641 implements MigrationInterface {
  name = 'CreateOrganization1749808158641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_organizetype_enum" AS ENUM('1', '2', '3', '4', '5', '6')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" SERIAL NOT NULL, "taxId" character varying NOT NULL, "organizeType" "public"."organization_organizetype_enum" NOT NULL DEFAULT '1', "organizeName" character varying NOT NULL, "cisNumber" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_merchant" ("id" SERIAL NOT NULL, "merchantId" integer NOT NULL, "organizeId" integer NOT NULL, CONSTRAINT "PK_5f4bb55ecfe1aaba9e06247a056" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_organization" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "organizeId" integer NOT NULL, CONSTRAINT "PK_3e103cdf85b7d6cb620b4db0f0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_merchant" ADD CONSTRAINT "FK_637019e89efec084240c84a71a6" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_merchant" ADD CONSTRAINT "FK_269e7d024b9798c762b1ec90ae4" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ADD CONSTRAINT "FK_29c3c8cc3ea9db22e4a347f4b5a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" ADD CONSTRAINT "FK_b8005638d6e2a530e82f40438da" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_organization" DROP CONSTRAINT "FK_b8005638d6e2a530e82f40438da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" DROP CONSTRAINT "FK_29c3c8cc3ea9db22e4a347f4b5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_merchant" DROP CONSTRAINT "FK_269e7d024b9798c762b1ec90ae4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_merchant" DROP CONSTRAINT "FK_637019e89efec084240c84a71a6"`,
    );
    await queryRunner.query(`DROP TABLE "user_organization"`);
    await queryRunner.query(`DROP TABLE "organization_merchant"`);
    await queryRunner.query(`DROP TABLE "organization"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_organizetype_enum"`,
    );
  }
}
