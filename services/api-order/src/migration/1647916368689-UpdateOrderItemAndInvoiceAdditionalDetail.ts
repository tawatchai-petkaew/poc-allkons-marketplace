import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderItemAndInvoiceAdditionalDetail1647916368689
  implements MigrationInterface
{
  name = 'UpdateOrderItemAndInvoiceAdditionalDetail1647916368689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "productItemName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "productItemImageUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paymentMethodBankSlug" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paymentMethodQRCodeImage" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "paymentMethodQRCodeImage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP COLUMN "paymentMethodBankSlug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "productItemImageUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP COLUMN "productItemName"`,
    );
  }
}
