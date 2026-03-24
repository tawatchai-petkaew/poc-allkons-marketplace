import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantTranslationTable1622701180754
  implements MigrationInterface
{
  name = 'CreateMerchantTranslationTable1622701180754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_translation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "merchantId" integer, CONSTRAINT "PK_ca1182eee43eff72b4adb4b3675" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" ADD CONSTRAINT "FK_92004ed9f1faab6dd34bba91b2f" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" DROP CONSTRAINT "FK_92004ed9f1faab6dd34bba91b2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "merchant_translation"`);
  }
}
