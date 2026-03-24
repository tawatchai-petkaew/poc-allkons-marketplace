import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoumnToRoleAndUserTable1752828584769
  implements MigrationInterface
{
  name = 'AddCoumnToRoleAndUserTable1752828584769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_businesstype_enum" AS ENUM('AGENT', 'BIXBOX', 'MDT', 'ONL', 'FAC', 'CON', 'CH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "businessType" "public"."user_businesstype_enum" array DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "displayName" character varying(32)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "displayName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "businessType"`);
    await queryRunner.query(`DROP TYPE "public"."user_businesstype_enum"`);
  }
}
