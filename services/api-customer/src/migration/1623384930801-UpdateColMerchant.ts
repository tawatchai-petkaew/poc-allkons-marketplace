import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColMerchant1623384930801 implements MigrationInterface {
  name = 'UpdateColMerchant1623384930801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "tel" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "email" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "contactAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "postCodeContactAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "provinceContactAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "districtContactAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "subdistrictContactAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "lineSocialContact" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "facebookSocialContact" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "youtubeSocialContact" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "instagramSocialContact" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "companyName" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "companyId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "companyBranch" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "companyAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "postCodeCompanyAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "provinceCompanyAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "districtCompanyAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD "subdistrictCompanyAddress" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" ADD "description" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_translation" DROP COLUMN "description"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "subdistrictCompanyAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "districtCompanyAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "provinceCompanyAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "postCodeCompanyAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "companyAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "companyBranch"`
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "companyId"`);
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "companyName"`);
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "instagramSocialContact"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "youtubeSocialContact"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "facebookSocialContact"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "lineSocialContact"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "subdistrictContactAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "districtContactAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "provinceContactAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "postCodeContactAddress"`
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP COLUMN "contactAddress"`
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "tel"`);
  }
}
