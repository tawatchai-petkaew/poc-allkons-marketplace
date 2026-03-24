import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomerTable1639970600740 implements MigrationInterface {
  name = 'UpdateCustomerTable1639970600740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "countryCode" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "tel" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "tel" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "countryCode" SET NOT NULL`
    );
  }
}
