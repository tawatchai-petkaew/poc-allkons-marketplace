import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStepUser1709887429981 implements MigrationInterface {
  name = 'addStepUser1709887429981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_onboardingstep_enum" AS ENUM('createMerchant', 'firstProduct', 'selectPackage', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "onBoardingStep" "public"."user_onboardingstep_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "onBoardingStep"`);
    await queryRunner.query(`DROP TYPE "public"."user_onboardingstep_enum"`);
  }
}
