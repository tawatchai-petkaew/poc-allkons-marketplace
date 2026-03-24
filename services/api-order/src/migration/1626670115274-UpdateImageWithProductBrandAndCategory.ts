import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateImageWithProductBrandAndCategory1626670115274
  implements MigrationInterface
{
  name = 'UpdateImageWithProductBrandAndCategory1626670115274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_brand" DROP CONSTRAINT "FK_1f61ae18d5b19cb9812af216f9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" DROP CONSTRAINT "REL_1f61ae18d5b19cb9812af216f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_33dc54b1fb7e745f0d353f936b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "REL_33dc54b1fb7e745f0d353f936b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" ADD CONSTRAINT "FK_1f61ae18d5b19cb9812af216f9c" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_33dc54b1fb7e745f0d353f936b6" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_33dc54b1fb7e745f0d353f936b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" DROP CONSTRAINT "FK_1f61ae18d5b19cb9812af216f9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "REL_33dc54b1fb7e745f0d353f936b" UNIQUE ("imageUploadId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_33dc54b1fb7e745f0d353f936b6" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" ADD CONSTRAINT "REL_1f61ae18d5b19cb9812af216f9" UNIQUE ("imageUploadId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_brand" ADD CONSTRAINT "FK_1f61ae18d5b19cb9812af216f9c" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
