import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPendingVerifyStatusToOrder1630290692726
  implements MigrationInterface {
  name = 'AddPendingVerifyStatusToOrder1630290692726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "order_status_enum" RENAME TO "order_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM('pendingPayment', 'pendingVerify', 'prepareProduct', 'shipping', 'returnProduct', 'success', 'cancel', 'expire')`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" TYPE "order_status_enum" USING "status"::"text"::"order_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`
    );
    await queryRunner.query(`DROP TYPE "order_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_status_enum_old" AS ENUM('pendingPayment', 'prepareProduct', 'shipping', 'returnProduct', 'success', 'cancel', 'expire')`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" TYPE "order_status_enum_old" USING "status"::"text"::"order_status_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pendingPayment'`
    );
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "order_status_enum_old" RENAME TO "order_status_enum"`
    );
  }
}
