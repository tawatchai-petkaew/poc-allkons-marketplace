import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOmniauthIdentityOnMerchant1640663879175
  implements MigrationInterface {
  name = 'UpdateOmniauthIdentityOnMerchant1640663879175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "omniauth_identity" ADD "merchantId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "omniauth_identity" ADD CONSTRAINT "FK_254e7e75fcbacf0235bcc6d6c9d" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "omniauth_identity" DROP CONSTRAINT "FK_254e7e75fcbacf0235bcc6d6c9d"`
    );
    await queryRunner.query(
      `ALTER TABLE "omniauth_identity" DROP COLUMN "merchantId"`
    );
  }
}
