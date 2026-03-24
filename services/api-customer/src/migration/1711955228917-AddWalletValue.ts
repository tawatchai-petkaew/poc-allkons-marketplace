import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletValue1711955228917 implements MigrationInterface {
  name = 'AddWalletValue1711955228917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "walletValue" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" ADD "walletValueDisplay" double precision NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "walletValueDisplay"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_subscription_package" DROP COLUMN "walletValue"`
    );
  }
}
