import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsEditOrderTimeAndOrderTimeToMerchant1713412948448
  implements MigrationInterface {
  name = 'AddIsEditOrderTimeAndOrderTimeToMerchant1713412948448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "isEditOrderTime" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "orderExpireTime" double precision NOT NULL DEFAULT '259200000'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "orderSuccessTime" double precision NOT NULL DEFAULT '604800000'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "orderSuccessTime"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "orderExpireTime"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "isEditOrderTime"`
    );
  }
}
