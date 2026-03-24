import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeeplinkToMerchant1663645879718 implements MigrationInterface {
  name = 'AddDeeplinkToMerchant1663645879718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "deeplinkHostUrl" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "deeplinkHostUrl"`
    );
  }
}
