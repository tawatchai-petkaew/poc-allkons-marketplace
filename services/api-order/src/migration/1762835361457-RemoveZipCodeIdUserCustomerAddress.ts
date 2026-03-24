import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveZipCodeIdUserCustomerAddress1762835361457
  implements MigrationInterface
{
  name = 'RemoveZipCodeIdUserCustomerAddress1762835361457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP CONSTRAINT "FK_178775430405c7cc837229c1762"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" DROP COLUMN "zipcodeId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD "zipcodeId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_customer_address" ADD CONSTRAINT "FK_178775430405c7cc837229c1762" FOREIGN KEY ("zipcodeId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
