import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShopditGlobalConfig1670225177396
  implements MigrationInterface
{
  name = 'CreateShopditGlobalConfig1670225177396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "shopdit_global_config_registeradmintype_enum" AS ENUM('public', 'private', 'unavailable')`,
    );
    await queryRunner.query(
      `CREATE TYPE "shopdit_global_config_createmerchanttype_enum" AS ENUM('public', 'private', 'unavailable')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shopdit_global_config" ("id" SERIAL NOT NULL, "registerAdminType" "shopdit_global_config_registeradmintype_enum" NOT NULL DEFAULT 'public', "createMerchantType" "shopdit_global_config_createmerchanttype_enum" NOT NULL DEFAULT 'public', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_9c2bcbda5a489f46aaa5a494108" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "shopdit_global_config"`);
    await queryRunner.query(
      `DROP TYPE "shopdit_global_config_createmerchanttype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "shopdit_global_config_registeradmintype_enum"`,
    );
  }
}
