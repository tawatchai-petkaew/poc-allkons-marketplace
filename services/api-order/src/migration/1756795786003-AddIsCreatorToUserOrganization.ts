import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCreatorToUserOrganization1756795786003
  implements MigrationInterface
{
  name = 'AddIsCreatorToUserOrganization1756795786003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_organization" ADD "isCreator" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user_organization"."isCreator" IS 'Indicates if the user is the creator of the organization'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "user_organization"."isCreator" IS 'Indicates if the user is the creator of the organization'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_organization" DROP COLUMN "isCreator"`,
    );
  }
}
