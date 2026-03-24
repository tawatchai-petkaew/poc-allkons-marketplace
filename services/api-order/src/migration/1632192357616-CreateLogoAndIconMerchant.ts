import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogoAndIconMerchant1632192357616
  implements MigrationInterface
{
  name = 'CreateLogoAndIconMerchant1632192357616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "merchant_icon" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "imageUploadId" integer, CONSTRAINT "REL_c8edefaeae571d6aef66785524" UNIQUE ("merchantId"), CONSTRAINT "PK_3f6ae0c9ad89a7ff48c0620646c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_logo" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "imageUploadId" integer, CONSTRAINT "REL_442fda530c10917e435dd55df6" UNIQUE ("merchantId"), CONSTRAINT "PK_26196c492cf020eead723b37cad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_icon" ADD CONSTRAINT "FK_c8edefaeae571d6aef667855246" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_icon" ADD CONSTRAINT "FK_3b8d269d2e8e94a6da84dc3b35b" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_logo" ADD CONSTRAINT "FK_442fda530c10917e435dd55df69" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_logo" ADD CONSTRAINT "FK_acd885f4d68f563eaf43b39272e" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_logo" DROP CONSTRAINT "FK_acd885f4d68f563eaf43b39272e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_logo" DROP CONSTRAINT "FK_442fda530c10917e435dd55df69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_icon" DROP CONSTRAINT "FK_3b8d269d2e8e94a6da84dc3b35b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_icon" DROP CONSTRAINT "FK_c8edefaeae571d6aef667855246"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_logo"`);
    await queryRunner.query(`DROP TABLE "merchant_icon"`);
  }
}
