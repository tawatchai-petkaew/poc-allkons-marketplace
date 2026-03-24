import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampStatusToOrderAndInvoice1646982467585
  implements MigrationInterface {
  name = 'AddTimestampStatusToOrderAndInvoice1646982467585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ADD "verifiedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "order" ADD "completedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "order" ADD "cancelAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelAt"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "completedAt"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "verifiedAt"`);
  }
}
