import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActionTypeToCustomerWalletTransaction1660789958955
  implements MigrationInterface {
  name = 'AddActionTypeToCustomerWalletTransaction1660789958955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_wallet_transaction_actiontype_enum" AS ENUM('earnByOrder', 'useByOrder', 'cancelOrder', 'expireOrder')`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet_transaction" ADD "actionType" "customer_wallet_transaction_actiontype_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet_transaction" ADD "actionValue" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_wallet_transaction" DROP COLUMN "actionValue"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_wallet_transaction" DROP COLUMN "actionType"`
    );
    await queryRunner.query(
      `DROP TYPE "customer_wallet_transaction_actiontype_enum"`
    );
  }
}
