import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusAndExpireToMerchantTable1623903698407
  implements MigrationInterface {
  name = 'AddStatusAndExpireToMerchantTable1623903698407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_status_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "status" "merchant_status_enum" NOT NULL DEFAULT 'active'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "verified" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "expiredDate" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "expiredDate"`);
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "verified"`);
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "merchant_status_enum"`);
  }
}
