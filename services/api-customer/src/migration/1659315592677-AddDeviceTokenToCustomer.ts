import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceTokenToCustomer1659315592677
  implements MigrationInterface {
  name = 'AddDeviceTokenToCustomer1659315592677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "currentDeviceToken" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "currentDeviceToken"`
    );
  }
}
