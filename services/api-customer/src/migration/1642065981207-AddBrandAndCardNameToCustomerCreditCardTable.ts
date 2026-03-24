import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrandAndCardNameToCustomerCreditCardTable1642065981207
  implements MigrationInterface {
  name = 'AddBrandAndCardNameToCustomerCreditCardTable1642065981207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" ADD "cardName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" ADD "customerCardToken" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" ADD "brand" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" ADD "isDefault" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" DROP COLUMN "isDefault"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" DROP COLUMN "brand"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" DROP COLUMN "customerCardToken"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer_credit_card" DROP COLUMN "cardName"`
    );
  }
}
