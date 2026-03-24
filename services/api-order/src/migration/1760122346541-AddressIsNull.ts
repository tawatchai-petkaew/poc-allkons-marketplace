import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddressIsNull1760122346541 implements MigrationInterface {
  name = 'AddressIsNull1760122346541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ALTER COLUMN "address" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_user_address" ALTER COLUMN "address" SET NOT NULL`,
    );
  }
}
