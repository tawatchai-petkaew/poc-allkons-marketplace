import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDeviceTable1641522062481 implements MigrationInterface {
  name = 'CreateDeviceTable1641522062481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "device_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `CREATE TABLE "device" ("id" SERIAL NOT NULL, "registrationToken" character varying NOT NULL, "status" "device_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "device" ADD CONSTRAINT "FK_7a4db7e86fc8c4e434604398481" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device" DROP CONSTRAINT "FK_7a4db7e86fc8c4e434604398481"`
    );
    await queryRunner.query(`DROP TABLE "device"`);
    await queryRunner.query(`DROP TYPE "device_status_enum"`);
  }
}
