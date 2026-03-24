import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldToUserTable1749180437395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCisNumber = await queryRunner.hasColumn('user', 'cisNumber');
    if (!hasCisNumber) {
      await queryRunner.query(
        `ALTER TABLE "user" ADD COLUMN "cisNumber" VARCHAR NULL`,
      );
    }

    const hasIdCard = await queryRunner.hasColumn('user', 'idCard');
    if (!hasIdCard) {
      await queryRunner.query(
        `ALTER TABLE "user" ADD COLUMN "idCard" VARCHAR NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "cisNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "idCard"`,
    );
  }
}
