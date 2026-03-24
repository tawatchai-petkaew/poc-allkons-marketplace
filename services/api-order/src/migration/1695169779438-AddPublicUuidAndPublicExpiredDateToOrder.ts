import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicUuidAndPublicExpiredDateToOrder1695169779438
  implements MigrationInterface
{
  name = 'AddPublicUuidAndPublicExpiredDateToOrder1695169779438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "publicUuid" uuid DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "publicExpiredDate" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "publicExpiredDate"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "publicUuid"`);
  }
}
