import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTableOrderPayment1757649739549 implements MigrationInterface {
    name = 'AddTableOrderPayment1757649739549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sub_order_payment" ("id" SERIAL NOT NULL, "orderPaymentId" integer NOT NULL, "subOrderId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f7e92222192f0cc93b944c84c76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_payment" ("id" SERIAL NOT NULL, "paymentMethod" character varying NOT NULL, "payAmount" numeric(10,2) NOT NULL, "status" character varying NOT NULL, "payTime" TIMESTAMP NOT NULL, "transactionCode" character varying, "processingFeeNet" numeric(10,2), "orderId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_28c756d4fd41223fedfbd2750e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_payment_slip" ("id" SERIAL NOT NULL, "orderPaymentId" integer NOT NULL, "fileUploadId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_24f81f4453eedfbf5002da076f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sub_order_payment" ADD CONSTRAINT "FK_cdaac082e6c7359d9c4e77136e2" FOREIGN KEY ("orderPaymentId") REFERENCES "order_payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order_payment" ADD CONSTRAINT "FK_4af040ff5a409df3a314a3a9aad" FOREIGN KEY ("subOrderId") REFERENCES "sub_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_payment" ADD CONSTRAINT "FK_8e5de5355bcad91a7769f16504c" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_payment_slip" ADD CONSTRAINT "FK_19d4eeffb3747eac98fcc45c639" FOREIGN KEY ("orderPaymentId") REFERENCES "order_payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_payment_slip" ADD CONSTRAINT "FK_ac9691dae825f91c617c34bb4fb" FOREIGN KEY ("fileUploadId") REFERENCES "file_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_payment_slip" DROP CONSTRAINT "FK_ac9691dae825f91c617c34bb4fb"`);
        await queryRunner.query(`ALTER TABLE "order_payment_slip" DROP CONSTRAINT "FK_19d4eeffb3747eac98fcc45c639"`);
        await queryRunner.query(`ALTER TABLE "order_payment" DROP CONSTRAINT "FK_8e5de5355bcad91a7769f16504c"`);
        await queryRunner.query(`ALTER TABLE "sub_order_payment" DROP CONSTRAINT "FK_4af040ff5a409df3a314a3a9aad"`);
        await queryRunner.query(`ALTER TABLE "sub_order_payment" DROP CONSTRAINT "FK_cdaac082e6c7359d9c4e77136e2"`);
        await queryRunner.query(`DROP TABLE "order_payment_slip"`);
        await queryRunner.query(`DROP TABLE "order_payment"`);
        await queryRunner.query(`DROP TABLE "sub_order_payment"`);
    }

}
