import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOmiauthIdentityTable1639966956448
  implements MigrationInterface {
  name = 'CreateOmiauthIdentityTable1639966956448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "omniauth_identity_provider_enum" AS ENUM('apple', 'google', 'line', 'facebook')`
    );
    await queryRunner.query(
      `CREATE TABLE "omniauth_identity" ("id" SERIAL NOT NULL, "provider" "omniauth_identity_provider_enum" NOT NULL, "uuid" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "PK_1fa85e845218f694d373e7db90f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "omniauth_identity" ADD CONSTRAINT "FK_6414d515dac6330ad86ce5d36ed" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "omniauth_identity" DROP CONSTRAINT "FK_6414d515dac6330ad86ce5d36ed"`
    );
    await queryRunner.query(`DROP TABLE "omniauth_identity"`);
    await queryRunner.query(`DROP TYPE "omniauth_identity_provider_enum"`);
  }
}
