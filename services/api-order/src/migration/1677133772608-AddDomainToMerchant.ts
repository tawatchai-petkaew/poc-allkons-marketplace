import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDomainToMerchant1677133772608 implements MigrationInterface {
  name = 'AddDomainToMerchant1677133772608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "domain" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "domain"`);
  }
}
