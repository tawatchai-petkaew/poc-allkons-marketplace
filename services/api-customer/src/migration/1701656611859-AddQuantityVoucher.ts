import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuantityVoucher1701656611859 implements MigrationInterface {
    name = 'AddQuantityVoucher1701656611859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher" ADD "quantity" integer`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD "usedQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD "usedPerUser" integer`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD "customerId" integer`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "vouchersId" integer`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."voucher_status_enum" RENAME TO "voucher_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."voucher_status_enum" AS ENUM('pending', 'prepare', 'completed', 'expired', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "status" TYPE "public"."voucher_status_enum" USING "status"::"text"::"public"."voucher_status_enum"`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."voucher_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "FK_6989ee24ef5d2672b35c5b0c9de" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_f8abdf61dbb963152a6ba434b5b" FOREIGN KEY ("vouchersId") REFERENCES "voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_f8abdf61dbb963152a6ba434b5b"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "FK_6989ee24ef5d2672b35c5b0c9de"`);
        await queryRunner.query(`CREATE TYPE "public"."voucher_status_enum_old" AS ENUM('pending', 'completed', 'expired', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "status" TYPE "public"."voucher_status_enum_old" USING "status"::"text"::"public"."voucher_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."voucher_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."voucher_status_enum_old" RENAME TO "voucher_status_enum"`);
        await queryRunner.query(`ALTER TABLE "voucher" ALTER COLUMN "code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "vouchersId"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP COLUMN "customerId"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP COLUMN "usedPerUser"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP COLUMN "usedQuantity"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP COLUMN "quantity"`);
    }

}
