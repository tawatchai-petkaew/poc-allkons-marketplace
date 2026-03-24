import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableUserMerchant1750871256843
  implements MigrationInterface
{
  name = 'UpdateTableUserMerchant1750871256843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_a08832429962c000f2bdfb66802"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_875bc9d2b01ab795b3c9bbd77d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_875bc9d2b01ab795b3c9bbd77d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a08832429962c000f2bdfb6680"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "originalPassword" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD "lastAccessedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_875bc9d2b01ab795b3c9bbd77d" ON "user_merchants_merchant" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a08832429962c000f2bdfb6680" ON "user_merchants_merchant" ("merchantId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_875bc9d2b01ab795b3c9bbd77d8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_a08832429962c000f2bdfb66802" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_a08832429962c000f2bdfb66802"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_875bc9d2b01ab795b3c9bbd77d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a08832429962c000f2bdfb6680"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_875bc9d2b01ab795b3c9bbd77d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP COLUMN "lastAccessedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "originalPassword"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a08832429962c000f2bdfb6680" ON "user_merchants_merchant" ("merchantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_875bc9d2b01ab795b3c9bbd77d" ON "user_merchants_merchant" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_875bc9d2b01ab795b3c9bbd77d8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_a08832429962c000f2bdfb66802" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
