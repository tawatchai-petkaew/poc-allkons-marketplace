import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantShipmentTable1629087784430
  implements MigrationInterface
{
  name = 'AddMerchantShipmentTable1629087784430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "calulate_shipment_method_type_enum" AS ENUM('weight', 'size')`,
    );
    await queryRunner.query(
      `CREATE TABLE "calulate_shipment_method" ("id" SERIAL NOT NULL, "type" "calulate_shipment_method_type_enum" NOT NULL DEFAULT 'weight', "from" double precision NOT NULL DEFAULT '0', "to" double precision NOT NULL DEFAULT '0', "price" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantShipmentId" integer, CONSTRAINT "PK_f871c33937e9cc97f5eed17fc7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shipment_company" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_08c9a79106ef7f1dbfaa3901a17" UNIQUE ("slug"), CONSTRAINT "PK_4b23abed9226da7e3253d79671d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_shipment_shipmenttype_enum" AS ENUM('pickup', 'transport')`,
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_shipment_paymentshipmenttype_enum" AS ENUM('free', 'payBeforeShipment', 'payAfterShipment')`,
    );
    await queryRunner.query(
      `CREATE TYPE "merchant_shipment_calculateshipmenttype_enum" AS ENUM('fixed', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_shipment" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "shipmentType" "merchant_shipment_shipmenttype_enum" NOT NULL DEFAULT 'pickup', "paymentShipmentType" "merchant_shipment_paymentshipmenttype_enum", "duration" character varying, "calculateShipmentType" "merchant_shipment_calculateshipmenttype_enum", "fixedPrice" integer, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "merchantWarehouseId" integer, "shipmentCompanyId" integer, CONSTRAINT "PK_60f48c460daf7ef3491e19c154f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "calulate_shipment_method" ADD CONSTRAINT "FK_1402c1e4be07ace7dc541510894" FOREIGN KEY ("merchantShipmentId") REFERENCES "merchant_shipment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ADD CONSTRAINT "FK_3f17fd5644faa56789b04b90030" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ADD CONSTRAINT "FK_3783e8bc7b678d814adabd906b9" FOREIGN KEY ("merchantWarehouseId") REFERENCES "merchant_warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" ADD CONSTRAINT "FK_e36374e9a0aa5557547f67cffea" FOREIGN KEY ("shipmentCompanyId") REFERENCES "shipment_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" DROP CONSTRAINT "FK_e36374e9a0aa5557547f67cffea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" DROP CONSTRAINT "FK_3783e8bc7b678d814adabd906b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_shipment" DROP CONSTRAINT "FK_3f17fd5644faa56789b04b90030"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calulate_shipment_method" DROP CONSTRAINT "FK_1402c1e4be07ace7dc541510894"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_shipment"`);
    await queryRunner.query(
      `DROP TYPE "merchant_shipment_calculateshipmenttype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "merchant_shipment_paymentshipmenttype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "merchant_shipment_shipmenttype_enum"`);
    await queryRunner.query(`DROP TABLE "shipment_company"`);
    await queryRunner.query(`DROP TABLE "calulate_shipment_method"`);
    await queryRunner.query(`DROP TYPE "calulate_shipment_method_type_enum"`);
  }
}
