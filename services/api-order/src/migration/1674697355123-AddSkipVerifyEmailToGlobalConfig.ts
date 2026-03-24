import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkipVerifyEmailToGlobalConfig1674697355123
  implements MigrationInterface
{
  name = 'AddSkipVerifyEmailToGlobalConfig1674697355123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" ADD "skipVerifyAdminEmail" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shopdit_global_config" DROP COLUMN "skipVerifyAdminEmail"`,
    );
  }
}
