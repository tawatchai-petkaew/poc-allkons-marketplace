import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullableFullName1634738023515 implements MigrationInterface {
  name = 'UpdateNullableFullName1634738023515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "fullName" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "fullName" SET NOT NULL`,
    );
  }
}
