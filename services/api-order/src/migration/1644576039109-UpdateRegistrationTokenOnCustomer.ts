import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRegistrationTokenOnCustomer1644576039109
  implements MigrationInterface
{
  name = 'UpdateRegistrationTokenOnCustomer1644576039109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device" DROP COLUMN "registrationToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "registrationToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "registrationToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device" ADD "registrationToken" character varying NOT NULL`,
    );
  }
}
