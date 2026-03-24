import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSubOrder1757487660075 implements MigrationInterface {
    name = 'CreateSubOrder1757487660075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sub_order_document_documenttype_enum" AS ENUM('PO')`);
        await queryRunner.query(`CREATE TABLE "sub_order_document" ("id" SERIAL NOT NULL, "subOrderId" integer NOT NULL, "documentType" "public"."sub_order_document_documenttype_enum" NOT NULL, "fileId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_863552c97b68ca90aa20545a9f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sub_order_status_enum" AS ENUM('NEW', 'PENDING_PAYMENT', 'PENDING_VERIFY', 'PREPARE_PROUDCT', 'SHIPPING', 'RETURN_PRODUCT', 'SUCCESS', 'CANCEL', 'EXPIRE')`);
        await queryRunner.query(`CREATE TYPE "public"."sub_order_deliverytime_enum" AS ENUM('ANYTIME', 'MORNING', 'AFTERNOON')`);
        await queryRunner.query(`CREATE TYPE "public"."sub_order_deliveryby_enum" AS ENUM('AGENT', 'OUTSOURCE')`);
        await queryRunner.query(`CREATE TABLE "sub_order" ("id" SERIAL NOT NULL, "subOrderNumber" text NOT NULL, "status" "public"."sub_order_status_enum" NOT NULL DEFAULT 'NEW', "orderId" integer NOT NULL, "refPONumber" character varying, "deliveryDate" date, "deliveryTime" "public"."sub_order_deliverytime_enum", "deliveryBy" "public"."sub_order_deliveryby_enum", "deliveryPrice" integer NOT NULL DEFAULT '0', "deliveryNote" text, "receiverName" text NOT NULL, "receiverPhone" text NOT NULL, "projectName" text, "addressName" text NOT NULL, "address" text NOT NULL, "countryId" integer NOT NULL, "provinceId" integer NOT NULL, "districtId" integer NOT NULL, "subDistrictId" integer NOT NULL, "zipcodeId" integer NOT NULL, "remark" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_e07c98da0cb6b2b2c59c811af62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "order" ADD "organizationId" integer`);
        await queryRunner.query(`ALTER TABLE "order" ADD "cartId" integer`);
        await queryRunner.query(`ALTER TABLE "order" ADD "totalPrice" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "totalDeliveryPrice" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "grandTotal" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "deliveryType" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "deliveryReceiveType" character varying`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "subOrderId" integer`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('new', 'inProgress', 'success', 'pendingPayment', 'pendingVerify', 'prepareProduct', 'shipping', 'returnProduct', 'cancel', 'expire')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sub_order_document" ADD CONSTRAINT "FK_2f3aa973b9f0bd51e2f22a40e8e" FOREIGN KEY ("subOrderId") REFERENCES "sub_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order_document" ADD CONSTRAINT "FK_f9af8f3e7cfbf71155153817794" FOREIGN KEY ("fileId") REFERENCES "file_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_4447a2b720214f17688c73f3e1c" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_d8b4f2dd1d131be17eb719aa912" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_53aed1cffaa27422a81fd65648f" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_96a8725176609124a173dee4cd3" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_9df4d1edae3e3be2730c8f85f6e" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_order" ADD CONSTRAINT "FK_ed95fa3b5c743db398472ea31b9" FOREIGN KEY ("zipcodeId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_1096e6a21a8fe57923546a2e9cc" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_fe3963d525b2ee03ba471953a7c" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_c4275d16b99178c809cc508bc5a" FOREIGN KEY ("subOrderId") REFERENCES "sub_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_c4275d16b99178c809cc508bc5a"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_fe3963d525b2ee03ba471953a7c"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_1096e6a21a8fe57923546a2e9cc"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_ed95fa3b5c743db398472ea31b9"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_9df4d1edae3e3be2730c8f85f6e"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_96a8725176609124a173dee4cd3"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_53aed1cffaa27422a81fd65648f"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_d8b4f2dd1d131be17eb719aa912"`);
        await queryRunner.query(`ALTER TABLE "sub_order" DROP CONSTRAINT "FK_4447a2b720214f17688c73f3e1c"`);
        await queryRunner.query(`ALTER TABLE "sub_order_document" DROP CONSTRAINT "FK_f9af8f3e7cfbf71155153817794"`);
        await queryRunner.query(`ALTER TABLE "sub_order_document" DROP CONSTRAINT "FK_2f3aa973b9f0bd51e2f22a40e8e"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum_old" AS ENUM('pendingPayment', 'pendingVerify', 'prepareProduct', 'shipping', 'returnProduct', 'success', 'cancel', 'expire')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "subOrderId"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveryReceiveType"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveryType"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "grandTotal"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "totalDeliveryPrice"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cartId"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "userId"`);
        await queryRunner.query(`DROP TABLE "sub_order"`);
        await queryRunner.query(`DROP TYPE "public"."sub_order_deliveryby_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sub_order_deliverytime_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sub_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "sub_order_document"`);
        await queryRunner.query(`DROP TYPE "public"."sub_order_document_documenttype_enum"`);
    }

}
