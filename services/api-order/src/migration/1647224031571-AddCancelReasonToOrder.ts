import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCancelReasonToOrder1647224031571 implements MigrationInterface {
  name = 'AddCancelReasonToOrder1647224031571';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_cancelreason_enum" AS ENUM('editOrderDetail', 'changeAddress', 'changePayment', 'editCoupon', 'paymentComplicated', 'otherOrChangeYourMind', 'notToBuy', 'sellerNotRespond')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "cancelReason" "order_cancelreason_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_cancelby_enum" AS ENUM('admin', 'customer', 'system')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "cancelBy" "order_cancelby_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelBy"`);
    await queryRunner.query(`DROP TYPE "order_cancelby_enum"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelReason"`);
    await queryRunner.query(`DROP TYPE "order_cancelreason_enum"`);
  }
}
