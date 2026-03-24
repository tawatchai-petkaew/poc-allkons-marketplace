import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldToDraftProfileAndMerchantTable1749370079691
  implements MigrationInterface
{
  name = 'AddFieldToDraftProfileAndMerchantTable1749370079691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "cisNumber" character varying(100)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "merchant"."cisNumber" IS 'Cis number for merchant, used for linking with CIS system'`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" ADD "refreshToken" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "draft_profile"."refreshToken" IS 'refresh token from auth center'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "draft_profile"."refreshToken" IS 'refresh token from auth center'`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_profile" DROP COLUMN "refreshToken"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "merchant"."cisNumber" IS 'Cis number for merchant, used for linking with CIS system'`,
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "cisNumber"`);
  }
}
