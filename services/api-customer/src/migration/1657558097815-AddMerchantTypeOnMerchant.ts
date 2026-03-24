import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantTypeOnMerchant1657558097815
  implements MigrationInterface {
  name = 'AddMerchantTypeOnMerchant1657558097815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "merchant_merchanttype_enum" AS ENUM('public', 'private')`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "merchantType" "merchant_merchanttype_enum" NOT NULL DEFAULT 'public'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "merchantType"`
    );
    await queryRunner.query(`DROP TYPE "merchant_merchanttype_enum"`);
  }
}
