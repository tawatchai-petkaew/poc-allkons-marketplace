import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantWarehouseTable1628524338475
  implements MigrationInterface
{
  name = 'AddMerchantWarehouseTable1628524338475';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_warehouse" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying, "postCodeAddress" character varying, "provinceAddress" character varying, "districtAddress" character varying, "subdistrictAddress" character varying, "tel" character varying NOT NULL, "availableTime" character varying NOT NULL, "isDefault" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_0bf99924c8e8799c79259a6d8f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_warehouse" ADD CONSTRAINT "FK_9789d5b6af0f07088f78df760b6" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_warehouse" DROP CONSTRAINT "FK_9789d5b6af0f07088f78df760b6"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_warehouse"`);
  }
}
