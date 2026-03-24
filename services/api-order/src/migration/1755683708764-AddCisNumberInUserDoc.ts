import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCisNumberInUserDoc1755683708764 implements MigrationInterface {
  name = 'AddCisNumberInUserDoc1755683708764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" ADD "cisNumber" character varying(50)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user_identity_documents"."cisNumber" IS 'Response id by CIS system'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "user_identity_documents"."cisNumber" IS 'Response id by CIS system'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" DROP COLUMN "cisNumber"`,
    );
  }
}
