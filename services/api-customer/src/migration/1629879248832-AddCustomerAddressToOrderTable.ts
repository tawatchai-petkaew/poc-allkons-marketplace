import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerAddressToOrderTable1629879248832
  implements MigrationInterface {
  name = 'AddCustomerAddressToOrderTable1629879248832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "customerAddressId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_1091144f0f74bfa8131b5a229ce" FOREIGN KEY ("customerAddressId") REFERENCES "customer_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_1091144f0f74bfa8131b5a229ce"`
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "customerAddressId"`
    );
  }
}
