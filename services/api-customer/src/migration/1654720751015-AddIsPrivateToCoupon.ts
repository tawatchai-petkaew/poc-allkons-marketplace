import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPrivateToCoupon1654720751015 implements MigrationInterface {
  name = 'AddIsPrivateToCoupon1654720751015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "coupon_isprivate_enum" AS ENUM('active', 'inActive')`
    );
    await queryRunner.query(
      `ALTER TABLE "coupon" ADD "isPrivate" "coupon_isprivate_enum" NOT NULL DEFAULT 'inActive'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "coupon" DROP COLUMN "isPrivate"`);
    await queryRunner.query(`DROP TYPE "coupon_isprivate_enum"`);
  }
}
