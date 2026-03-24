import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToCustomerAddressTable1629882005034
  implements MigrationInterface {
  name = 'AddNameToCustomerAddressTable1629882005034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_address" ADD "name" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_address" DROP COLUMN "name"`
    );
  }
}
