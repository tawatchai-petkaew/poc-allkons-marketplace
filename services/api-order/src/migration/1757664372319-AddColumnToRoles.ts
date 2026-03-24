import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToRoles1757664372319 implements MigrationInterface {
  name = 'AddColumnToRoles1757664372319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "isDefault" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "roles"."isDefault" IS 'Flag สำหรับเช็กว่าเป็นบทบาทโดยระบบ'`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "isClone" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "roles"."isClone" IS 'Flag สำหรับเช็กว่าต้องการ clone บทบาทนี้มั้ย'`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "UQ_7e74e742c08bf2a3f2e51baf832" UNIQUE ("name", "organizeId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "UQ_7e74e742c08bf2a3f2e51baf832"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isClone"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isDefault"`);
  }
}
