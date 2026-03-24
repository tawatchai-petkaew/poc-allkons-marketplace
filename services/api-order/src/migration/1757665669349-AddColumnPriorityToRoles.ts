import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnPriorityToRoles1757665669349
  implements MigrationInterface
{
  name = 'AddColumnPriorityToRoles1757665669349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" ADD "priority" smallint`);
    await queryRunner.query(
      `COMMENT ON COLUMN "roles"."priority" IS 'ค่าสำหรับแสดงลำดับความสำคัญของบทบาท'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "priority"`);
  }
}
