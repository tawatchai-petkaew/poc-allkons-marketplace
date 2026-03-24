import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatContractToMerchant1707560279651
  implements MigrationInterface
{
  name = 'AddChatContractToMerchant1707560279651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "chatContract" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "chatContract"`,
    );
  }
}
