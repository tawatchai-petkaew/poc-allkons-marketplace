import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserStatusEnum1648720221801 implements MigrationInterface {
  name = 'UpdateUserStatusEnum1648720221801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "user_status_enum" RENAME TO "user_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM('active', 'inActive', 'pending')`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "status" TYPE "user_status_enum" USING "status"::"text"::"user_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`
    );
    await queryRunner.query(`DROP TYPE "user_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_status_enum_old" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "status" TYPE "user_status_enum_old" USING "status"::"text"::"user_status_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`
    );
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "user_status_enum_old" RENAME TO "user_status_enum"`
    );
  }
}
