import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateColumnCustomerAddress1754554462505 implements MigrationInterface {
    name = 'UpdateColumnCustomerAddress1754554462505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_e1cd1d79df451a3c90d28a6b939"`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_e27f39d24e31acfd86d328e12f5"`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ALTER COLUMN "organizeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."user_customer_address_addresstype_enum" RENAME TO "user_customer_address_addresstype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_customer_address_addresstype_enum" AS ENUM('SHIPPING_ADDRESS', 'WORK_SITE_ADDRESS')`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ALTER COLUMN "addressType" TYPE "public"."user_customer_address_addresstype_enum" USING "addressType"::"text"::"public"."user_customer_address_addresstype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_customer_address_addresstype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_e1cd1d79df451a3c90d28a6b939" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_e27f39d24e31acfd86d328e12f5" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_e27f39d24e31acfd86d328e12f5"`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_e1cd1d79df451a3c90d28a6b939"`);
        await queryRunner.query(`CREATE TYPE "public"."user_customer_address_addresstype_enum_old" AS ENUM('SHIPPING_ADDRESS', 'WORK_SITE_ADDRESS')`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ALTER COLUMN "addressType" TYPE "public"."user_customer_address_addresstype_enum_old" USING "addressType"::"text"::"public"."user_customer_address_addresstype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_customer_address_addresstype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_customer_address_addresstype_enum_old" RENAME TO "user_customer_address_addresstype_enum"`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ALTER COLUMN "organizeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_e27f39d24e31acfd86d328e12f5" FOREIGN KEY ("organizeId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_e1cd1d79df451a3c90d28a6b939" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
