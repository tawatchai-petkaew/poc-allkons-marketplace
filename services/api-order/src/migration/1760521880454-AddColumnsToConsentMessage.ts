import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsToConsentMessage1760521880454
  implements MigrationInterface
{
  name = 'AddColumnsToConsentMessage1760521880454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "consent_message" ADD "subject" text`);
    await queryRunner.query(
      `ALTER TABLE "consent_message" ADD "akIdConsentId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "consent_message" DROP COLUMN "akIdConsentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_message" DROP COLUMN "subject"`,
    );
  }
}
