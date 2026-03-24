import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoreCancelReasonAdmin1654654587309
  implements MigrationInterface
{
  name = 'AddMoreCancelReasonAdmin1654654587309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "order_cancelreason_enum" RENAME TO "order_cancelreason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_cancelreason_enum" AS ENUM('editOrderDetail', 'changeAddress', 'changePayment', 'editCoupon', 'paymentComplicated', 'otherOrChangeYourMind', 'notToBuy', 'sellerNotRespond', 'productOutOfStock', 'noPayment', 'canNotDeliverOnTime')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "cancelReason" TYPE "order_cancelreason_enum" USING "cancelReason"::"text"::"order_cancelreason_enum"`,
    );
    await queryRunner.query(`DROP TYPE "order_cancelreason_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_cancelreason_enum_old" AS ENUM('changeAddress', 'changePayment', 'editCoupon', 'editOrderDetail', 'notToBuy', 'otherOrChangeYourMind', 'paymentComplicated', 'sellerNotRespond')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "cancelReason" TYPE "order_cancelreason_enum_old" USING "cancelReason"::"text"::"order_cancelreason_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "order_cancelreason_enum"`);
    await queryRunner.query(
      `ALTER TYPE "order_cancelreason_enum_old" RENAME TO "order_cancelreason_enum"`,
    );
  }
}
